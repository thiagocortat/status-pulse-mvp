'use client'

import RequireAuth from '@/components/RequireAuth'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Service {
  id: string
  name: string
  status: string | null
  last_checked_at: string | null
}

export default function ProjectPage() {
  const supabase = useSupabaseClient()
  const { id } = useParams<{ id: string }>()
  const [services, setServices] = useState<Service[]>([])
  const [project, setProject] = useState<{ name: string } | null>(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState('GET')
  const [expectedStatus, setExpectedStatus] = useState(200)

  useEffect(() => {
    if (id) {
      supabase
        .from('projects')
        .select('name')
        .eq('id', id)
        .single()
        .then(({ data }) => setProject(data))

      supabase
        .from('services')
        .select('id,name,status,last_checked_at')
        .eq('project_id', id)
        .then(({ data }) => setServices(data || []))
    }
  }, [id, supabase])

  const createService = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('services')
      .insert({
        name,
        url,
        method,
        expected_status: expectedStatus,
        project_id: id,
      })
      .select('id,name,status,last_checked_at')
      .single()
    if (!error && data) {
      setServices([...services, data])
      setName('')
      setUrl('')
      setMethod('GET')
      setExpectedStatus(200)
    } else if (error) {
      alert(error.message)
    }
  }

  return (
    <RequireAuth>
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-xl font-bold">{project?.name}</h1>
        <form onSubmit={createService} className="flex flex-col gap-2">
          <input
            placeholder="Service name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border p-2 rounded"
          />
          <div className="flex gap-2">
            <input
              placeholder="Method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <input
              type="number"
              placeholder="Expected status"
              value={expectedStatus}
              onChange={(e) => setExpectedStatus(Number(e.target.value))}
              className="border p-2 rounded w-40"
            />
          </div>
          <button type="submit" className="bg-black text-white p-2 rounded">
            Add Service
          </button>
        </form>
        <table className="w-full border">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Service</th>
              <th className="p-2">Status</th>
              <th className="p-2">Last Check</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.name}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-white ${s.status === 'online' ? 'bg-green-500' : s.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}>{s.status ?? 'unknown'}</span>
                </td>
                <td className="p-2">{s.last_checked_at ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RequireAuth>
  )
}
