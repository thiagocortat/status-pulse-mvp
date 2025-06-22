import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: services } = await supabase
    .from('services')
    .select('id,url,method,headers,body,expected_status,expected_body,status,project_id')

  if (!services) return new Response('no services')

  for (const service of services) {
    try {
      const start = Date.now()
      const res = await fetch(service.url, {
        method: service.method,
        headers: service.headers || undefined,
        body: service.body || undefined,
      })
      const responseTime = Date.now() - start
      const text = await res.text()
      const success =
        res.status === service.expected_status &&
        (!service.expected_body || text.includes(service.expected_body))
      await supabase.from('status_checks').insert({
        service_id: service.id,
        checked_at: new Date().toISOString(),
        success,
        status_code: res.status,
        response_time_ms: responseTime,
        matched_body: service.expected_body ? text.includes(service.expected_body) : null,
        error_message: null,
      })
      let newStatus: 'online' | 'degraded' | 'offline' = success ? 'online' : 'offline'
      if (newStatus !== service.status) {
        await supabase
          .from('services')
          .update({ status: newStatus, last_checked_at: new Date().toISOString() })
          .eq('id', service.id)
        if (newStatus !== 'online') {
          await supabase.from('incidents').insert({
            service_id: service.id,
            title: `${service.name} is ${newStatus}`,
            description: 'Automatic detection',
            status: 'open',
            started_at: new Date().toISOString(),
          })
        }
      } else {
        await supabase
          .from('services')
          .update({ last_checked_at: new Date().toISOString() })
          .eq('id', service.id)
      }
    } catch (e) {
      await supabase.from('status_checks').insert({
        service_id: service.id,
        checked_at: new Date().toISOString(),
        success: false,
        status_code: null,
        response_time_ms: null,
        matched_body: null,
        error_message: String(e),
      })
      await supabase
        .from('services')
        .update({ status: 'offline', last_checked_at: new Date().toISOString() })
        .eq('id', service.id)
    }
  }

  return new Response('ok')
})
