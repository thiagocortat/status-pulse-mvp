"use client"
import { Inbox } from "lucide-react"

export default function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center text-gray-500 flex flex-col items-center gap-1 p-6">
      <Inbox className="w-8 h-8" />
      <p className="text-sm">{children}</p>
    </div>
  )
}
