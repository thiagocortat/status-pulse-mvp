import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .neq('url', '')

  if (!services) {
    return NextResponse.json({ message: 'no services' })
  }

  for (const service of services) {
    const start = Date.now()
    let status: 'online' | 'degraded' | 'offline' =
      (service.status as 'online' | 'degraded' | 'offline') || 'online'
    try {
      let headers: Record<string, string> = {}
      if (service.headers) {
        try {
          headers =
            typeof service.headers === 'string'
              ? JSON.parse(service.headers)
              : (service.headers as Record<string, string>)
        } catch {
          headers = {}
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(service.url, {
        method: service.method,
        headers,
        body: ['POST', 'PUT', 'PATCH'].includes(service.method)
          ? service.body ?? undefined
          : undefined,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      const duration = Date.now() - start
      const text = await response.text()
      const matchedStatus = response.status === service.expected_status
      const matchedBody = service.expected_body
        ? text.includes(service.expected_body)
        : true

      const success = matchedStatus && matchedBody

      await supabase.from('status_checks').insert({
        service_id: service.id,
        checked_at: new Date().toISOString(),
        success,
        status_code: response.status,
        response_time_ms: duration,
        matched_body: service.expected_body ? matchedBody : null,
        error_message: null,
      })

      if (matchedStatus) {
        status = matchedBody ? 'online' : 'degraded'
      } else {
        status = 'offline'
      }
    } catch (err) {
      status = 'offline'
      await supabase.from('status_checks').insert({
        service_id: service.id,
        checked_at: new Date().toISOString(),
        success: false,
        status_code: null,
        response_time_ms: null,
        matched_body: null,
        error_message: err instanceof Error ? err.message : String(err),
      })
    }

    if (status !== service.status) {
      await supabase
        .from('services')
        .update({ status, last_checked_at: new Date().toISOString() })
        .eq('id', service.id)
    } else {
      await supabase
        .from('services')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('id', service.id)
    }

    if (service.status === 'online' && status === 'offline') {
      const { data: incident } = await supabase
        .from('incidents')
        .select('id')
        .eq('service_id', service.id)
        .eq('status', 'open')
        .maybeSingle()

      if (!incident) {
        await supabase.from('incidents').insert({
          service_id: service.id,
          title: `${service.name} offline`,
          description: 'Automatic detection',
          status: 'open',
          started_at: new Date().toISOString(),
        })
      }
    }
  }

  return NextResponse.json({ message: 'ok' })
}
