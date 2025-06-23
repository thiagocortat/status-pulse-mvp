'use client'

import { useEffect } from 'react'

export default function Toast({
  message,
  onClear,
}: {
  message: string | null
  onClear: () => void
}) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClear, 3000)
    return () => clearTimeout(t)
  }, [message, onClear])

  if (!message) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow">
      {message}
    </div>
  )
}
