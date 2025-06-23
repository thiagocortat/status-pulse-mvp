'use client'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import RequestBodyInput from '@/components/RequestBodyInput'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Project {
  id: string
  name: string
  user_id: string
}

interface Service {
  id: string
  name: string
  url: string
  method: string
  headers: Record<string, string> | null
  body: string | null
  expected_status: number
  expected_body: string | null
}

export default function EditServicePage() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const { slug, serviceId } = useParams<{ slug: string; serviceId: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState('GET')
  const [headers, setHeaders] = useState('{}')
  const [body, setBody] = useState('')
  const [expectedStatus, setExpectedStatus] = useState(200)
  const [expectedBody, setExpectedBody] = useState('')

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
        .select('*')
        .eq('id', serviceId)
        .single()
      if (!svc || svc.project_id !== proj.id) {
        alert('Serviço não encontrado')
        router.replace(`/dashboard/projects/${slug}/services`)
        return
      }
      setService(svc as Service)
      setName(svc.name)
      setUrl(svc.url)
      setMethod(svc.method)
      setHeaders(JSON.stringify(svc.headers || {}, null, 2))
      setBody(svc.body || '')
      setExpectedStatus(svc.expected_status)
      setExpectedBody(svc.expected_body || '')
      setLoading(false)
    }
    load()
  }, [user, slug, serviceId, supabase, router])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    let headersObj: Record<string, string> = {}
    try {
      headersObj = headers ? JSON.parse(headers) : {}
    } catch {
      alert('Headers inválidos')
      return
    }
    const { error } = await supabase
      .from('services')
      .update({
        name,
        url,
        method,
        headers: headersObj,
        body: body || null,
        expected_status: expectedStatus,
        expected_body: expectedBody || null,
      })
      .eq('id', serviceId)
    if (!error) {
      router.push(`/dashboard/projects/${slug}/services`)
    } else {
      alert(error.message)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!project || !service) return null

  return (
    <form
      onSubmit={save}
      className="max-w-2xl mx-auto flex flex-col gap-4 bg-white rounded-xl shadow-sm p-4"
    >
      <h1 className="text-xl font-bold">Editar serviço {service.name}</h1>
      <input
        className="border rounded-lg px-3 py-2"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="border rounded-lg px-3 py-2"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <select
        className="border rounded-lg px-3 py-2"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
      >
        {['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>
      <textarea
        className="border rounded-lg px-3 py-2 font-mono text-sm"
        placeholder="Headers (JSON)"
        value={headers}
        onChange={(e) => setHeaders(e.target.value)}
      />
      {method !== 'GET' && (
        <RequestBodyInput
          value={body}
          onChange={(val) => setBody(val)}
        />
      )}
      <input
        type="number"
        className="border rounded-lg px-3 py-2"
        placeholder="Status esperado"
        value={expectedStatus}
        onChange={(e) => setExpectedStatus(Number(e.target.value))}
      />
      <input
        className="border rounded-lg px-3 py-2"
        placeholder="Substring esperada (opcional)"
        value={expectedBody}
        onChange={(e) => setExpectedBody(e.target.value)}
      />
      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg" type="submit">
        Salvar
      </button>
    </form>
  )
}

