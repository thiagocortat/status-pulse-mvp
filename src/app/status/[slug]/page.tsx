import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { notFound } from 'next/navigation'
import StatusBadge from '@/components/StatusBadge'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 60

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} minuto${minutes === 1 ? '' : 's'} atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hora${hours === 1 ? '' : 's'} atrás`
  const days = Math.floor(hours / 24)
  return `${days} dia${days === 1 ? '' : 's'} atrás`
}

async function getData(slug: string) {
  const { data: project } = await supabase
    .from('projects')
    .select('id,name')
    .eq('slug', slug)
    .single()

  if (!project) return null

  const { data: services } = await supabase
    .from('services')
    .select('id,name,status,last_checked_at')
    .eq('project_id', project.id)

  const serviceIds = services?.map((s) => s.id) || []

  const { data: incidents } = await supabase
    .from('incidents')
    .select('id,title,status,started_at,resolved_at,service_id')
    .in('service_id', serviceIds)
    .neq('status', 'resolved')
    .order('started_at', { ascending: false })
    .limit(5)

  const since = new Date()
  since.setDate(since.getDate() - 6)
  since.setHours(0, 0, 0, 0)

  const { data: checks } = await supabase
    .from('status_checks')
    .select('checked_at,success')
    .in('service_id', serviceIds)
    .gte('checked_at', since.toISOString())

  const uptimeMap: Record<string, { ok: number; failures: number }> = {}
  checks?.forEach((c) => {
    const day = c.checked_at.split('T')[0]
    if (!uptimeMap[day]) uptimeMap[day] = { ok: 0, failures: 0 }
    if (c.success) uptimeMap[day].ok++
    else uptimeMap[day].failures++
  })
  const uptime: { day: string; ok: number; failures: number }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().split('T')[0]
    uptime.push({ day: key, ok: uptimeMap[key]?.ok || 0, failures: uptimeMap[key]?.failures || 0 })
  }

  const lastCheck = services?.reduce<string | null>((acc, s) => {
    if (s.last_checked_at && (!acc || new Date(s.last_checked_at) > new Date(acc))) {
      return s.last_checked_at
    }
    return acc
  }, null) || null

  return {
    project,
    services: services || [],
    incidents: incidents || [],
    uptime,
    lastCheck,
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getData(slug)
  if (!data) {
    notFound()
  }

  const serviceMap = new Map(data.services.map((s) => [s.id, s.name]))
  const lastCheckText = data.lastCheck ? timeAgo(new Date(data.lastCheck)) : null
  const baseUrl = process.env.NEXT_PUBLIC_STATUS_BASE_URL || ''
  const publicUrl = `${baseUrl}/status/${slug}`

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">{data.project.name}</h1>
        <p className="text-sm text-gray-500">{publicUrl}</p>
        {lastCheckText && (
          <p className="text-xs text-gray-500">Última atualização: {lastCheckText}</p>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Serviços monitorados</h2>
        <div className="space-y-2">
          {data.services.map((s) => (
            <div key={s.id} className="border rounded-xl p-4 flex justify-between items-center bg-white shadow-sm">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-gray-500">
                  {s.last_checked_at ? new Date(s.last_checked_at).toLocaleString() : '-'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={s.status} />
                <a href={`/dashboard/projects/${slug}/services/${s.id}/history`} className="text-sm underline">
                  Histórico
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Incidentes recentes</h2>
        {data.incidents.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum incidente aberto.</p>
        )}
        <ul className="space-y-2">
          {data.incidents.map((i) => (
            <li key={i.id} className="border p-4 rounded-xl bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{i.title}</p>
                  <p className="text-sm">Serviço: {serviceMap.get(i.service_id) || i.service_id}</p>
                  <p className="text-sm">Iniciado em {new Date(i.started_at).toLocaleString()}</p>
                </div>
                <StatusBadge status={i.status} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {data.uptime.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold">Uptime (últimos 7 dias)</h2>
          <div className="flex gap-1">
            {data.uptime.map((u) => (
              <div
                key={u.day}
                className={`flex-1 h-2 rounded-sm ${u.failures > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                title={`${u.day} - ${u.failures > 0 ? 'Falhas' : 'OK'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

