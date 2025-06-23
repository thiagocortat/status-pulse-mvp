'use client'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import HeaderInputList, { Header } from '@/components/HeaderInputList'
import TestConfigurationButton from '@/components/TestConfigurationButton'
import RequestBodyInput from '@/components/RequestBodyInput'
import LoadingSpinner from '@/components/LoadingSpinner'

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

  if (loading) return <LoadingSpinner />
  if (!project) return null

  return (
    <form
      onSubmit={save}
      className="max-w-2xl mx-auto flex flex-col gap-4 bg-white rounded-xl shadow-sm p-4"
    >
      <h1 className="text-xl font-bold">Novo serviço em {project.name}</h1>
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
      <HeaderInputList headers={headers} onChange={setHeaders} />
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
      <TestConfigurationButton
        url={url}
        method={method}
        headers={headers}
        body={body}
        expectedStatus={expectedStatus}
        expectedBody={expectedBody}
      />
      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg" type="submit">
        Salvar
      </button>
    </form>
  )
}

