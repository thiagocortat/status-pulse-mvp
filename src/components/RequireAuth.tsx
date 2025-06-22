'use client'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useSessionContext()
  const router = useRouter()
  useEffect(() => {
    if (!isLoading && session === null) {
      router.replace('/login')
    }
  }, [session, isLoading, router])

  if (isLoading) return null
  if (!session) return null
  return <>{children}</>
}
