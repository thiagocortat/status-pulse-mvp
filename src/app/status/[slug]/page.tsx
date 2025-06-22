import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 60

async function getData(slug: string) {
  const { data: project } = await supabase
    .from('projects')
    .select('id,name')
    .eq('slug', slug)
    .single()
  if (!project) return null
  const { data: services } = await supabase
    .from('services')
    .select('id,name,status,last_checked_at')
    .eq('project_id', project.id)
  const { data: incidents } = await supabase
    .from('incidents')
    .select('title,status,started_at,resolved_at')
    .eq('service_id', services?.map((s) => s.id))
    .order('started_at', { ascending: false })
  return { project, services: services || [], incidents: incidents || [] }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Page({ params }: any) {
  const data = await getData(params.slug)
  if (!data) {
    return <div className="p-4">Project not found</div>
  }
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">{data.project.name}</h1>
      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Service</th>
            <th className="p-2">Status</th>
            <th className="p-2">Last Check</th>
          </tr>
        </thead>
        <tbody>
          {data.services.map((s) => (
            <tr key={s.name} className="border-b">
              <td className="p-2">{s.name}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-white ${s.status === 'online' ? 'bg-green-500' : s.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}>{s.status}</span>
              </td>
              <td className="p-2">{s.last_checked_at ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h2 className="font-bold mb-2">Incidents</h2>
        <ul className="space-y-2">
          {data.incidents.map((i, idx) => (
            <li key={idx} className="border p-2 rounded">
              <p className="font-semibold">{i.title}</p>
              <p>{i.status}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
