'use client'
import { useSession } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = useSession()
  const router = useRouter()
  useEffect(() => {
    if (session === null) {
      router.replace('/login')
    }
  }, [session, router])

  if (!session) return null
  return <>{children}</>
}
