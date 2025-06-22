'use client'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  user_id: string
}

interface Service {
  id: string
  name: string
  status: string | null
  project_id: string
}

interface StatusCheck {
  id: string
  checked_at: string
  success: boolean
  status_code: number | null
  response_time_ms: number | null
  matched_body: boolean | null
  error_message: string | null
}

interface DailyUptime {
  day: string
  ok: number
  total: number
}

export default function ServiceHistoryPage() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const { slug, serviceId } = useParams<{ slug: string; serviceId: string }>()

  const [project, setProject] = useState<Project | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [checks, setChecks] = useState<StatusCheck[]>([])
  const [daily, setDaily] = useState<DailyUptime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user || !slug || !serviceId) return

      const { data: proj } = await supabase
        .from('projects')
        .select('id,name,user_id')
        .eq('slug', slug)
        .single()

      if (!proj || proj.user_id !== user.id) {
        alert('Projeto não encontrado')
        router.replace('/dashboard')
        return
      }
      setProject(proj)

      const { data: svc } = await supabase
        .from('services')
        .select('id,name,status,project_id')
        .eq('id', serviceId)
        .single()

      if (!svc || svc.project_id !== proj.id) {
        alert('Serviço não encontrado')
        router.replace(`/dashboard/projects/${slug}/services`)
        return
      }
      setService(svc as Service)

      const { data: chk } = await supabase
        .from('status_checks')
        .select('*')
        .eq('service_id', serviceId)
        .order('checked_at', { ascending: false })
        .limit(50)
      setChecks(chk || [])

      const since = new Date()
      since.setDate(since.getDate() - 6)
      since.setHours(0, 0, 0, 0)

      const { data: recent } = await supabase
        .from('status_checks')
        .select('checked_at,success,response_time_ms')
        .eq('service_id', serviceId)
        .gte('checked_at', since.toISOString())

      const map: Record<string, { ok: number; total: number; resp: number }> = {}
      recent?.forEach((c) => {
        const day = c.checked_at.split('T')[0]
        if (!map[day]) map[day] = { ok: 0, total: 0, resp: 0 }
        if (c.success) map[day].ok++
        map[day].total++
        map[day].resp += c.response_time_ms || 0
      })

      const days: DailyUptime[] = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(since)
        d.setDate(d.getDate() + i)
        const key = d.toISOString().split('T')[0]
        const m = map[key] || { ok: 0, total: 0, resp: 0 }
        days.push({ day: key, ok: m.ok, total: m.total })
      }
      setDaily(days.reverse())

      setLoading(false)
    }
    load()
  }, [user, slug, serviceId, supabase, router])

  if (loading) return <div>Carregando...</div>
  if (!project || !service) return null

  const totalChecks = checks.length
  const uptime7days =
    daily.reduce((acc, d) => acc + d.ok, 0) /
    (daily.reduce((acc, d) => acc + d.total, 0) || 1)
  const avgResponse =
    checks.reduce((acc, c) => acc + (c.response_time_ms || 0), 0) /
    (checks.length || 1)

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">{service.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            Status:{' '}
            <span
              className={`px-2 py-1 rounded text-white ${
                service.status === 'online'
                  ? 'bg-green-500'
                  : service.status === 'degraded'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            >
              {service.status ?? 'desconhecido'}
            </span>
          </div>
          <div>Total checks: {totalChecks}</div>
          <div>Uptime 7d: {(uptime7days * 100).toFixed(1)}%</div>
          <div>Avg resp: {avgResponse.toFixed(0)} ms</div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Uptime diário (7 dias)</h2>
        {daily.length === 0 && (
          <p className="text-sm text-gray-500">Sem dados suficientes.</p>
        )}
        <div className="space-y-1">
          {daily.map((d) => {
            const pct = d.total ? (d.ok / d.total) * 100 : 0
            return (
              <div key={d.day} className="flex items-center gap-2 text-sm">
                <span className="w-24">
                  {new Date(d.day).toLocaleDateString('pt-BR')}
                </span>
                <div className="flex-1 bg-gray-200 h-2 rounded">
                  <div
                    className={`h-2 rounded ${
                      pct === 100
                        ? 'bg-green-500'
                        : pct > 90
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right">{pct.toFixed(0)}%</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Últimas checagens</h2>
        {checks.length === 0 && (
          <p className="text-sm text-gray-500">Nenhuma checagem registrada.</p>
        )}
        {checks.length > 0 && (
          <table className="w-full border text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Data</th>
                <th className="p-2">Status</th>
                <th className="p-2">Tempo (ms)</th>
                <th className="p-2">Resultado</th>
                <th className="p-2">Erro</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-2">
                    {new Date(c.checked_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-2 text-center">{c.status_code ?? '-'}</td>
                  <td className="p-2 text-center">
                    {c.response_time_ms ?? '-'}
                  </td>
                  <td className="p-2 text-center">
                    {c.success ? (
                      c.status_code === 200 ? (
                        <span className="text-green-600">✅</span>
                      ) : (
                        <span className="text-yellow-600">⚠️</span>
                      )
                    ) : (
                      <span className="text-red-600">❌</span>
                    )}
                  </td>
                  <td className="p-2 whitespace-pre-wrap">
                    {c.error_message || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

