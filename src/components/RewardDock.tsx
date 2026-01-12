"use client"

import { useEffect, useMemo, useState } from "react"
import { Flame, Sparkles, Trophy, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import type { RewardState } from "@/lib/rewards"
import { progressToNextLevel, xpToNextLevel } from "@/lib/rewards"
import { cn } from "@/lib/utils"

export default function RewardDock({
  rewards,
  onClearToast,
  quests,
}: {
  rewards: RewardState
  onClearToast: () => void
  quests: { label: string; done: number; total: number }[]
}) {
  const pct = progressToNextLevel(rewards.xp)
  const toNext = xpToNextLevel(rewards.xp)

  const achievedCount = useMemo(
    () => Object.values(rewards.achievements || {}).filter(Boolean).length,
    [rewards.achievements]
  )

  // tiny “pop” animation trigger
  const [pulse, setPulse] = useState(false)
  useEffect(() => {
    if (rewards.lastReward) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 500)
      return () => clearTimeout(t)
    }
  }, [rewards.lastReward])

  return (
    <div className="rounded-2xl border border-border bg-white/70 p-4 shadow-[0_8px_24px_rgba(2,6,23,0.06)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft transition",
                pulse ? "scale-[1.03]" : "scale-100"
              )}
              aria-hidden
            >
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">
                Level {rewards.level}
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                {toNext} XP to next level
              </div>
            </div>
          </div>

          <div className="mt-2">
            <Progress value={pct} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-border bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-primary" />
              <div className="text-sm font-semibold">{rewards.streakDays}</div>
              <div className="text-xs text-muted-foreground">day streak</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-primary" />
              <div className="text-sm font-semibold">{achievedCount}</div>
              <div className="text-xs text-muted-foreground">badges</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quests (motivates action) */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {quests.map((q) => {
          const qPct = q.total ? Math.round((q.done / q.total) * 100) : 0
          return (
            <div key={q.label} className="rounded-2xl border border-border bg-white p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {q.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {q.done}/{q.total}
                </div>
              </div>
              <Progress className="mt-2" value={qPct} />
            </div>
          )
        })}
      </div>

      {/* Reward toast */}
      {rewards.lastReward ? (
        <div className="mt-4 rounded-2xl border border-border bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold">
                +{rewards.lastReward.xpGained} XP — {rewards.lastReward.title}
              </div>
              <div className="text-sm text-muted-foreground">
                {rewards.lastReward.message}
                {rewards.lastReward.leveledUp ? (
                  <span className="ml-2 font-semibold text-foreground">
                    Level up! → {rewards.lastReward.newLevel}
                  </span>
                ) : null}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl"
              onClick={onClearToast}
              aria-label="Dismiss reward"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
