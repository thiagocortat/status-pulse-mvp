"use client"
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react"

export default function StatusBadge({ status }: { status: string | null }) {
  const base = "px-2 py-1 rounded text-white text-xs flex items-center gap-1"
  if (status === "online") {
    return (
      <span className={`${base} bg-green-500`}>
        <CheckCircle className="w-4 h-4" /> online
      </span>
    )
  }
  if (status === "degraded") {
    return (
      <span className={`${base} bg-yellow-500`}>
        <AlertTriangle className="w-4 h-4" /> degradado
      </span>
    )
  }
  if (status === "offline") {
    return (
      <span className={`${base} bg-red-500`}>
        <XCircle className="w-4 h-4" /> offline
      </span>
    )
  }
  return (
    <span className={`${base} bg-gray-400`}>
      <HelpCircle className="w-4 h-4" /> desconhecido
    </span>
  )
}
