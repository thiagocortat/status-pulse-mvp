'use client'

import { X } from 'lucide-react'

export type Header = { key: string; value: string }

export type HeaderInputListProps = {
  headers: Header[]
  onChange: (headers: Header[]) => void
}

export default function HeaderInputList({ headers, onChange }: HeaderInputListProps) {
  // Ensure at least one empty row at the end
  const rows = [...headers]
  if (rows.length === 0 || rows[rows.length - 1].key || rows[rows.length - 1].value) {
    rows.push({ key: '', value: '' })
  }

  const update = (index: number, field: 'key' | 'value', value: string) => {
    const copy = [...rows]
    copy[index] = { ...copy[index], [field]: value }
    if (index === rows.length - 1 && (copy[index].key || copy[index].value)) {
      copy.push({ key: '', value: '' })
    }
    onChange(copy.filter((h) => h.key || h.value))
  }

  const remove = (index: number) => {
    const copy = rows.filter((_, i) => i !== index)
    if (copy.length === 0 || copy[copy.length - 1].key || copy[copy.length - 1].value) {
      copy.push({ key: '', value: '' })
    }
    onChange(copy.filter((h) => h.key || h.value))
  }

  return (
    <div className="space-y-2">
      {rows.map((h, idx) => (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2" key={idx}>
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Authorization"
            value={h.key}
            onChange={(e) => update(idx, 'key', e.target.value)}
          />
          <input
            className="border rounded-lg px-3 py-2 text-sm"
            placeholder="Bearer abc123"
            value={h.value}
            onChange={(e) => update(idx, 'value', e.target.value)}
          />
          {rows.length > 1 && idx < rows.length - 1 && (
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-red-600 hover:text-red-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

