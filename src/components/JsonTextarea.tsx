"use client"
import { useEffect, useState } from "react"

export default function JsonTextarea({ value, onChange, placeholder }: {
  value: string
  onChange: (val: string, valid: boolean) => void
  placeholder?: string
}) {
  const [text, setText] = useState(value)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    setText(value)
    try {
      if (value.trim()) JSON.parse(value)
      setIsValid(true)
    } catch {
      setIsValid(false)
    }
  }, [value])

  const handle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setText(val)
    try {
      if (val.trim()) JSON.parse(val)
      setIsValid(true)
      onChange(val, true)
    } catch {
      setIsValid(false)
      onChange(val, false)
    }
  }

  return (
    <div className="space-y-1">
      <textarea
        value={text}
        onChange={handle}
        placeholder={placeholder}
        className={`border rounded p-2 font-mono text-sm w-full ${isValid ? 'border-green-500' : 'border-red-500'}`}
      />
      <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>{isValid ? 'JSON válido' : 'JSON inválido'}</p>
    </div>
  )
}
