'use client'

import { useState } from 'react'
import type { Header } from './HeaderInputList'

export type TestConfigurationButtonProps = {
  url: string
  method: string
  headers: Header[]
  body: string
  expectedStatus: number
  expectedBody?: string
}

type TestResult = {
  status?: number
  duration?: number
  bodySnippet?: string
  codeValid?: boolean
  bodyValid?: boolean
  error?: string
}

export default function TestConfigurationButton({
  url,
  method,
  headers,
  body,
  expectedStatus,
  expectedBody,
}: TestConfigurationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const runTest = async () => {
    setLoading(true)
    setResult(null)

    // build headers object
    const headersObj: Record<string, string> = {}
    headers.forEach((h) => {
      if (h.key) headersObj[h.key] = h.value
    })

    const init: RequestInit = { method, headers: headersObj }

    if (body) {
      try {
        JSON.parse(body)
        init.body = body
        init.headers = {
          'Content-Type': 'application/json',
          ...headersObj,
        }
      } catch {
        setResult({ error: 'Body inválido (JSON malformado)' })
        setLoading(false)
        return
      }
    }

    const start = performance.now()
    try {
      const resp = await fetch(url, init)
      const end = performance.now()
      const text = await resp.text()
      const snippet = text.slice(0, 300)
      const codeValid = resp.status === expectedStatus
      const bodyValid = expectedBody ? text.includes(expectedBody) : true
      setResult({
        status: resp.status,
        duration: Math.round(end - start),
        bodySnippet: snippet,
        codeValid,
        bodyValid,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro de conexão'
      setResult({ error: message })
    }
    setLoading(false)
  }

  const getColor = () => {
    if (!result) return ''
    if (result.error) return 'border-red-500 text-red-600'
    if (!result.codeValid) return 'border-yellow-500 text-yellow-600'
    if (!result.bodyValid) return 'border-red-500 text-red-600'
    return 'border-green-500 text-green-600'
  }

  const getMessage = () => {
    if (!result) return ''
    if (result.error) return `\u274c ${result.error}`
    if (!result.codeValid)
      return `\u26a0\ufe0f Código inesperado: esperado ${expectedStatus}, recebido ${result.status}`
    if (!result.bodyValid) return `\u26a0\ufe0f Body inválido`
    return `\u2705 Tudo certo: código ${result.status}`
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={runTest}
        disabled={loading}
        className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testando...' : 'Testar Configuração'}
      </button>
      {result && (
        <div className={`border p-2 rounded text-sm ${getColor()}`}>
          {result.status !== undefined && (
            <p>
              <strong>Status:</strong> {result.status}
            </p>
          )}
          {result.duration !== undefined && (
            <p>
              <strong>Tempo:</strong> {result.duration} ms
            </p>
          )}
          {result.bodySnippet !== undefined && (
            <pre className="whitespace-pre-wrap break-all">
              {result.bodySnippet}
            </pre>
          )}
          <p>{getMessage()}</p>
        </div>
      )}
    </div>
  )
}

