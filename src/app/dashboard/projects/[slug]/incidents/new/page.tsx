'use client'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Project {
  id: string
  name: string
  user_id: string
}

interface Service {
  id: string
  name: string
}

export default function NewIncidentPage() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const [serviceId, setServiceId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startedAt, setStartedAt] = useState(
    new Date().toISOString().slice(0, 16),
  )

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
      if (servs && servs[0]) setServiceId(servs[0].id)
      setLoading(false)
    }
    load()
  }, [user, slug, supabase, router])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceId || !title) return
    const { error } = await supabase.from('incidents').insert({
      service_id: serviceId,
      title,
      description: description || null,
      status: 'open',
      started_at: new Date(startedAt).toISOString(),
    })
    if (!error) {
      router.push(`/dashboard/projects/${slug}/incidents`)
    } else {
      alert(error.message)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!project) return null

  return (
    <form onSubmit={save} className="max-w-2xl mx-auto flex flex-col gap-4 bg-white rounded-xl shadow-sm p-4">
      <h1 className="text-xl font-bold">Novo incidente em {project.name}</h1>
      <select
        className="border rounded-lg px-3 py-2"
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
        required
      >
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <input
        className="border rounded-lg px-3 py-2"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="border rounded-lg px-3 py-2"
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="datetime-local"
        className="border rounded-lg px-3 py-2"
        value={startedAt}
        onChange={(e) => setStartedAt(e.target.value)}
      />
      <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
        Salvar
      </button>
    </form>
  )
}

