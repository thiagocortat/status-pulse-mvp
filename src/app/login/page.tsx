'use client'

import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function LoginPage() {
  const supabase = useSupabaseClient()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (!error) {
      alert('Check your email for the magic link.')
    } else {
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
