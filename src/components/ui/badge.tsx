import * as React from "react"
import { cn } from "@/lib/utils"

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-white px-2.5 py-1 text-xs text-foreground shadow-[0_1px_0_rgba(2,6,23,0.04)]",
        className
      )}
      {...props}
    />
  )
}
