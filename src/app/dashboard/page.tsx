'use client'

import RequireAuth from '@/components/RequireAuth'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

interface Project {
  id: string
  name: string
  slug: string
}

export default function Dashboard() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => {
    if (user) {
      supabase
        .from('projects')
        .select('id,name,slug')
        .eq('user_id', user.id)
        .then(({ data }) => setProjects(data || []))
    }
  }, [user, supabase])

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug) return
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, slug, user_id: user?.id })
      .select('id,name,slug')
      .single()
    if (!error && data) {
      setProjects([...projects, data])
      setName('')
      setSlug('')
    } else if (error) {
      alert(error.message)
    }
  }

  const logout = () => supabase.auth.signOut()

  return (
    <RequireAuth>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button onClick={logout} className="text-sm underline">
            Sign out
          </button>
        </div>
        <form onSubmit={createProject} className="flex gap-2">
          <input
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <input
            placeholder="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button type="submit" className="bg-black text-white p-2 rounded">
            Create
          </button>
        </form>
        <ul className="space-y-2">
          {projects.map((p) => (
            <li key={p.id} className="border p-2 rounded">
              <a href={`/dashboard/projects/${p.id}`}>{p.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </RequireAuth>
  )
}
