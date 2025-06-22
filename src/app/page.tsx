'use client'
import { useSession } from '@supabase/auth-helpers-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.replace('/dashboard')
    } else if (session === null) {
      router.replace('/login')
    }
  }, [session, router])

  return null
}
