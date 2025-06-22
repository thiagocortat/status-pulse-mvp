'use client'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Service {
  id: string
  name: string
  status: string | null
  last_checked_at: string | null
}

interface Project {
  id: string
  name: string
  user_id: string
}

export default function ServicesPage() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user || !slug) return
      console.log('loading project', { slug, user })
      const { data: proj, error: projError } = await supabase
        .from('projects')
        .select('id,name,user_id')
        .eq('slug', slug)
        .single()
      console.log('project result', { proj, projError })
      if (!proj || proj.user_id !== user.id) {
        console.warn('Project not found or unauthorized', { proj, userId: user.id })
        alert('Projeto não encontrado')
        router.replace('/dashboard')
        return
      }
      setProject(proj)
      const { data: servs, error: servsError } = await supabase
        .from('services')
        .select('id,name,status,last_checked_at')
        .eq('project_id', proj.id)
      console.log('services result', { servs, servsError })
      setServices(servs || [])
      setLoading(false)
    }
    load()
  }, [user, slug, supabase, router])

  const deleteService = async (id: string) => {
    if (!confirm('Excluir serviço?')) return
    await supabase.from('services').delete().eq('id', id)
    setServices((s) => s.filter((svc) => svc.id !== id))
  }

  if (loading) return <div>Carregando...</div>
  if (!project) return null

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{project.name}</h1>
        <div className="space-x-2">
          <a
            href={`/dashboard/projects/${slug}/incidents`}
            className="underline text-sm"
          >
            Incidentes
          </a>
          <a
            href={`/dashboard/projects/${slug}/services/new`}
            className="bg-black text-white px-3 py-1 rounded"
          >
            Novo Serviço
          </a>
        </div>
      </div>
      <table className="w-full border text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Serviço</th>
            <th className="p-2">Status</th>
            <th className="p-2">Última checagem</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="p-2">{s.name}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-white ${s.status === 'online' ? 'bg-green-500' : s.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}
                >
                  {s.status ?? 'desconhecido'}
                </span>
              </td>
              <td className="p-2">
                {s.last_checked_at
                  ? new Date(s.last_checked_at).toLocaleString()
                  : '-'}
              </td>
              <td className="p-2 space-x-2">
                <a
                  href={`/dashboard/projects/${slug}/services/${s.id}/edit`}
                  className="underline"
                >
                  Editar
                </a>
                <button onClick={() => deleteService(s.id)} className="underline text-red-600">
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

