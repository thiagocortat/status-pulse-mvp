'use client'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import HeaderInputList, { Header } from '@/components/HeaderInputList'

interface Project {
  id: string
  name: string
  user_id: string
}

export default function NewServicePage() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState('GET')
  const [headers, setHeaders] = useState<Header[]>([])
  const [body, setBody] = useState('')
  const [expectedStatus, setExpectedStatus] = useState(200)
  const [expectedBody, setExpectedBody] = useState('')

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
      setLoading(false)
    }
    load()
  }, [user, slug, supabase, router])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url || Number.isNaN(Number(expectedStatus))) {
      alert('Preencha os campos obrigatórios')
      return
    }
    const headersObj: Record<string, string> = {}
    headers.forEach((h) => {
      if (h.key) headersObj[h.key] = h.value
    })
    const { error } = await supabase.from('services').insert({
      project_id: project!.id,
      name,
      url,
      method,
      headers: headersObj,
      body: body || null,
      expected_status: expectedStatus,
      expected_body: expectedBody || null,
    })
    if (!error) {
      router.push(`/dashboard/projects/${slug}/services`)
    } else {
      alert(error.message)
    }
  }

  if (loading) return <div>Carregando...</div>
  if (!project) return null

  return (
    <form
      onSubmit={save}
      className="max-w-2xl mx-auto flex flex-col gap-2"
    >
      <h1 className="text-xl font-bold">Novo serviço em {project.name}</h1>
      <input
        className="border p-2 rounded"
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="border p-2 rounded"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <select
        className="border p-2 rounded"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
      >
        {['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>
      <HeaderInputList headers={headers} onChange={setHeaders} />
      {method !== 'GET' && (
        <textarea
          className="border p-2 rounded font-mono text-sm"
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      )}
      <input
        type="number"
        className="border p-2 rounded"
        placeholder="Status esperado"
        value={expectedStatus}
        onChange={(e) => setExpectedStatus(Number(e.target.value))}
      />
      <input
        className="border p-2 rounded"
        placeholder="Substring esperada (opcional)"
        value={expectedBody}
        onChange={(e) => setExpectedBody(e.target.value)}
      />
      <button className="bg-black text-white p-2 rounded" type="submit">
        Salvar
      </button>
    </form>
  )
}

