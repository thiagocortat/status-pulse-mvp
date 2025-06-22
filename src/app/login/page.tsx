'use client'

import { useEffect, useState } from 'react'
import {
  useSupabaseClient,
  useSession,
} from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    console.log('login page session', session)
    if (session) {
      console.log('redirecting to /dashboard')
      router.replace('/dashboard')
    }
  }, [session, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    console.log('sending magic link', email)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/login` },
    })
    if (!error) {
      alert('Check your email for the magic link.')
    } else {
      console.error('magic link error', error)
      alert(error.message)
    }
    setSending(false)
  }

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-sm mx-auto mt-40 flex flex-col gap-4"
    >
      <h1 className="text-xl font-bold text-center">Login</h1>
      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        disabled={sending}
        className="bg-black text-white p-2 rounded disabled:opacity-50"
      >
        Send Magic Link
      </button>
    </form>
  )
}
