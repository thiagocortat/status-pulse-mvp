'use client'

import { useEffect, useState } from 'react'

export type RequestBodyInputProps = {
  value: string
  onChange: (value: string, isValid: boolean) => void
}

export default function RequestBodyInput({ value, onChange }: RequestBodyInputProps) {
  const [text, setText] = useState(value)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    setText(value)
    try {
      if (value.trim()) {
        JSON.parse(value)
      }
      setIsValid(true)
    } catch {
      setIsValid(false)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setText(val)
    try {
      if (val.trim()) {
        JSON.parse(val)
      }
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
        className={`border rounded p-2 font-mono text-sm w-full ${isValid ? 'border-green-500' : 'border-red-500'}`}
        placeholder='{ "env": "production" }'
        value={text}
        onChange={handleChange}
      />
      <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
        {isValid ? 'JSON válido ✅' : 'JSON inválido ❌'}
      </p>
    </div>
  )
}
