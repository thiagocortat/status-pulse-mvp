'use client'

import RequireAuth from '@/components/RequireAuth'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = useSupabaseClient()
  const logout = () => supabase.auth.signOut()

  return (
    <RequireAuth>
      <div className="flex min-h-screen">
        <aside className="w-60 bg-gray-100 p-4">
          <h1 className="text-xl font-bold mb-4">Status Pulse</h1>
          <nav className="space-y-2">
            <a href="/dashboard" className="block">
              Projetos
            </a>
          </nav>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="border-b p-4 flex justify-end">
            <button onClick={logout} className="text-sm underline">
              Sign out
            </button>
          </header>
          <main className="flex-1 p-4">{children}</main>
        </div>
      </div>
    </RequireAuth>
  )
}
