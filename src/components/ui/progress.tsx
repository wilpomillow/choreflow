import * as React from "react"
import { cn } from "@/lib/utils"

export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full bg-primary" style={{ width: `${v}%` }} />
    </div>
  )
}
