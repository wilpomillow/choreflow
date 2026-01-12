"use client"

import Link from "next/link"
import { CheckCircle2, Circle, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ChoreMeta } from "@/lib/chores"
import { cn } from "@/lib/utils"

function formatRemaining(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const mins = Math.floor((s % 3600) / 60)
  const secs = s % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m ${secs}s`
}

export default function ChoreRow({
  chore,
  done,
  remainingMs,
  xp,
  onToggle,
  onUndo,
}: {
  chore: ChoreMeta
  done: boolean
  remainingMs: number | null
  xp: number
  onToggle: () => void
  onUndo: () => void
}) {
  return (
    <div
  className={cn(
    "group rounded-2xl border border-border px-4 py-3 transition",
    done ? "bg-muted/40 text-muted-foreground opacity-80" : "bg-white/70"
  )}
>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            "mt-0.5 rounded-full p-1 transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            done ? "text-muted-foreground" : "text-primary"
          )}
          aria-label={done ? "Mark as not done" : "Mark as done"}
        >
          {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Link
              href={`/chore/${chore.slug}`}
              className={cn(
                "min-w-0 truncate text-[15px] font-semibold hover:underline",
                done && "pointer-events-none no-underline"
              )}
              title={chore.title}
            >
              {chore.title}
            </Link>

            <div className="flex items-center gap-2">
              <Badge className="text-muted-foreground">{chore.frequency}</Badge>
              <Badge className="text-muted-foreground">{chore.estimateMinutes}m</Badge>

              {/* ✅ XP pill (only when not yet done) */}
              {!done ? (
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {xp} XP
                </span>
              ) : null}

              {/* Countdown pill appears when done */}
              {done && remainingMs != null ? (
                <Badge className="text-muted-foreground">
                  Resets in {formatRemaining(remainingMs)}
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Narrow viewport description below name on hover/focus */}
          <div
            className={cn(
              "mt-1 text-sm text-muted-foreground sm:hidden",
              "max-h-0 overflow-hidden opacity-0 transition-all duration-200",
              "group-hover:max-h-24 group-hover:opacity-100",
              "group-focus-within:max-h-24 group-focus-within:opacity-100"
            )}
          >
            {chore.shortDescription}
          </div>
        </div>

        {/* Undo button only when done */}
        {done ? (
          <button
            type="button"
            onClick={onUndo}
            className="mt-0.5 inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw size={16} className="text-muted-foreground" />
            Undo
          </button>
        ) : null}
      </div>

      {/* Wide viewport: show description inline on hover */}
      <div className="hidden md:block">
        <div
          className={cn(
            "mt-2 text-sm text-muted-foreground/80",
            "opacity-0 max-h-0 overflow-hidden transition-all duration-200",
            "group-hover:opacity-100 group-hover:max-h-24",
            "group-focus-within:opacity-100 group-focus-within:max-h-24"
          )}
        >
          {chore.shortDescription}
        </div>
      </div>
    </div>
  )
}
