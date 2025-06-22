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
}

interface Incident {
  id: string
  service_id: string
  title: string
  description: string | null
  status: 'open' | 'resolved'
  started_at: string
  resolved_at: string | null
}

export default function IncidentsPage() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()

  const [project, setProject] = useState<Project | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [openIncidents, setOpenIncidents] = useState<Incident[]>([])
  const [resolvedIncidents, setResolvedIncidents] = useState<Incident[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const formatDate = (date: string) => {
    const d = new Date(date)
    return (
      d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) +
      ' às ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    )
  }

  useEffect(() => {
    const load = async () => {
      if (!user || !slug) return
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
      const { data: servs } = await supabase
        .from('services')
        .select('id,name')
        .eq('project_id', proj.id)
      setServices(servs || [])
      const ids = servs?.map((s) => s.id) || []
      if (ids.length > 0) {
        const { data: open } = await supabase
          .from('incidents')
          .select('*')
          .in('service_id', ids)
          .eq('status', 'open')
          .order('started_at', { ascending: false })
        const { data: resolved } = await supabase
          .from('incidents')
          .select('*')
          .in('service_id', ids)
          .eq('status', 'resolved')
          .order('started_at', { ascending: false })
        setOpenIncidents(open || [])
        setResolvedIncidents(resolved || [])
      }
      setLoading(false)
    }
    load()
  }, [user, slug, supabase, router])

  const serviceMap = new Map(services.map((s) => [s.id, s.name]))

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const closeIncident = async (id: string) => {
    if (!confirm('Encerrar incidente?')) return
    const { error } = await supabase
      .from('incidents')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) {
      setOpenIncidents((incs) => incs.filter((i) => i.id !== id))
      const inc = openIncidents.find((i) => i.id === id)
      if (inc) {
        setResolvedIncidents((incs) => [
          { ...inc, status: 'resolved', resolved_at: new Date().toISOString() },
          ...incs,
        ])
      }
    } else {
      alert(error.message)
    }
  }

  if (loading) return <div>Carregando...</div>
  if (!project) return null

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{project.name} - Incidentes</h1>
        <div className="space-x-2">
          <a
            href={`/dashboard/projects/${slug}/services`}
            className="underline text-sm"
          >
            Serviços
          </a>
          <a
            href={`/dashboard/projects/${slug}/incidents/new`}
            className="bg-black text-white px-3 py-1 rounded"
          >
            Novo Incidente
          </a>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Abertos</h2>
        {openIncidents.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum incidente aberto.</p>
        )}
        <ul className="space-y-2">
          {openIncidents.map((i) => (
            <li key={i.id} className="border p-2 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{i.title}</p>
                  <p className="text-sm text-gray-600">
                    Serviço: {serviceMap.get(i.service_id) || i.service_id}
                  </p>
                  <p className="text-sm">Início: {formatDate(i.started_at)}</p>
                  {expanded.has(i.id) && i.description && (
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {i.description}
                    </p>
                  )}
                </div>
                <div className="space-y-2 text-right">
                  <span className="px-2 py-1 rounded text-white bg-red-500 text-sm">
                    aberto
                  </span>
                  <div className="space-x-2 text-sm">
                    <button
                      onClick={() => toggle(i.id)}
                      className="underline"
                    >
                      {expanded.has(i.id) ? 'Ocultar' : 'Ver detalhes'}
                    </button>
                    <button
                      onClick={() => closeIncident(i.id)}
                      className="underline text-green-600"
                    >
                      Encerrar
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Resolvidos</h2>
        {resolvedIncidents.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum incidente resolvido.</p>
        )}
        <ul className="space-y-2">
          {resolvedIncidents.map((i) => (
            <li key={i.id} className="border p-2 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{i.title}</p>
                  <p className="text-sm text-gray-600">
                    Serviço: {serviceMap.get(i.service_id) || i.service_id}
                  </p>
                  <p className="text-sm">Início: {formatDate(i.started_at)}</p>
                  {i.resolved_at && (
                    <p className="text-sm">Fim: {formatDate(i.resolved_at)}</p>
                  )}
                  {expanded.has(i.id) && i.description && (
                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      {i.description}
                    </p>
                  )}
                </div>
                <div className="space-y-2 text-right">
                  <span className="px-2 py-1 rounded text-white bg-gray-500 text-sm">
                    resolvido
                  </span>
                  <button
                    onClick={() => toggle(i.id)}
                    className="underline text-sm"
                  >
                    {expanded.has(i.id) ? 'Ocultar' : 'Ver detalhes'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

