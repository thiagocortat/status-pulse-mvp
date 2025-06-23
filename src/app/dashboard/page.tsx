'use client'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import Toast from '@/components/Toast'

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
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

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

  const deleteProject = async (project: Project) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o projeto '${project.name}'? Esta ação não pode ser desfeita.`,
      )
    )
      return
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)
      .eq('user_id', user?.id || '')
    if (!error) {
      setProjects((projs) => projs.filter((p) => p.id !== project.id))
      setToast('Projeto excluído com sucesso.')
    } else {
      setToast('Erro ao excluir projeto.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projetos</h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg"
        >
          {showForm ? 'Cancelar' : 'Novo Projeto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createProject} className="bg-white shadow-sm rounded-xl p-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            placeholder="Nome do projeto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
          <input
            placeholder="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
          Criar
        </button>
        </form>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <li
            key={p.id}
            className="border rounded-xl p-4 shadow-sm bg-white flex justify-between items-start group"
          >
            <a
              href={`/dashboard/projects/${p.slug}/services`}
              className="font-medium hover:underline"
            >
              {p.name}
            </a>
            <button
              onClick={() => deleteProject(p)}
              className="hidden group-hover:block p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
        {projects.length === 0 && (
          <li className="col-span-full">
            <p className="text-sm text-gray-500">Nenhum projeto cadastrado.</p>
          </li>
        )}
      </ul>
      <Toast message={toast} onClear={() => setToast(null)} />
    </div>
  )
}
