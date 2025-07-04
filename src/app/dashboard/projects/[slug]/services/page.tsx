'use client'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import StatusBadge from '@/components/StatusBadge'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { PenLine, Trash2, Clock } from 'lucide-react'

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
  const publicUrl = `${process.env.NEXT_PUBLIC_STATUS_BASE_URL || ''}/status/${slug}`

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

  if (loading) return <LoadingSpinner />
  if (!project) return null

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
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
            href={publicUrl}
            className="underline text-sm"
          >
            Página Pública
          </a>
          <a
            href={`/dashboard/projects/${slug}/services/new`}
            className="bg-black text-white px-3 py-1 rounded"
          >
            Novo Serviço
          </a>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {services.map((s) => (
          <div key={s.id} className="border rounded-xl bg-white p-4 shadow-sm flex justify-between items-start">
            <div>
              <p className="font-medium">{s.name}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {s.last_checked_at ? new Date(s.last_checked_at).toLocaleString() : '-'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={s.status} />
              <a href={`/dashboard/projects/${slug}/services/${s.id}/history`} className="text-sm text-gray-600 hover:underline">
                Histórico
              </a>
              <a href={`/dashboard/projects/${slug}/services/${s.id}/edit`} className="p-1 text-gray-600 hover:text-gray-800">
                <PenLine className="w-4 h-4" />
              </a>
              <button onClick={() => deleteService(s.id)} className="p-1 text-red-600 hover:text-red-800">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {services.length === 0 && <EmptyState>Nenhum serviço cadastrado.</EmptyState>}
      </div>
    </div>
  )
}

