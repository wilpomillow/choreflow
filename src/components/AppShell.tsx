"use client"

import { useEffect, useMemo, useState } from "react"
import { RotateCcw, SlidersHorizontal, Search } from "lucide-react"
import type { ChoreMeta } from "@/lib/chores"
import { useLocalStorageState } from "@/lib/useLocalStorage"
import ChoreRow from "@/components/ChoreRow"
import RewardDock from "@/components/RewardDock"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  DEFAULT_REWARDS,
  todayKey,
  xpForChore,
  levelFromXp,
  evaluateAchievements,
  maybeUpdateStreak,
  type RewardState,
} from "@/lib/rewards"

const STORAGE_DONE = "choreflow:done:v2"
const STORAGE_REWARDS = "choreflow:rewards:v1"

type DoneInfo = { doneAt: number; nextDueAt: number }
type DoneState = Record<string, DoneInfo>

export default function AppShell({ chores }: { chores?: ChoreMeta[] }) {
  const safeChores = Array.isArray(chores) ? chores : []

  const [doneState, setDoneState] = useLocalStorageState<DoneState>(STORAGE_DONE, {})
  const [rewards, setRewards] = useLocalStorageState<RewardState>(STORAGE_REWARDS, DEFAULT_REWARDS)

  const [now, setNow] = useState(() => Date.now())
  const [query, setQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState<"all" | "quick" | "weekly">("all")

  const today = todayKey()

  // Tick every second (for countdowns)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Auto-reset chores whose timer reached 0
  useEffect(() => {
    const keys = Object.keys(doneState)
    if (!keys.length) return

    let changed = false
    const next: DoneState = { ...doneState }

    for (const slug of keys) {
      const info = next[slug]
      if (!info) continue
      if (info.nextDueAt <= now) {
        delete next[slug]
        changed = true
      }
    }

    if (changed) setDoneState(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return safeChores
      .filter((c) => {
        const tags = Array.isArray(c.tags) ? c.tags : []
        return q ? (c.title + " " + tags.join(" ")).toLowerCase().includes(q) : true
      })
      .filter((c) => {
      const f = String(c.frequency ?? "").toLowerCase()

      if (filter === "all") return true
      if (filter === "quick") return (c.estimateMinutes ?? 999) <= 15
      if (filter === "weekly") return f.includes("week")
      if (filter === "biweekly") return f.includes("biweekly")
      if (filter === "quarterly") return f.includes("quarter")
      return true
    })
  }, [safeChores, query, filter])

  // ✅ Sort: undone first, done last; stable by title
  const list = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const ad = doneState[a.slug] ? 1 : 0
      const bd = doneState[b.slug] ? 1 : 0
      if (ad !== bd) return ad - bd
      return a.title.localeCompare(b.title)
    })
    return copy
  }, [filtered, doneState])

  const total = safeChores.length
  const doneCount = safeChores.filter((c) => !!doneState[c.slug]).length
  const pct = total ? Math.round((doneCount / total) * 100) : 0

  // Quests (simple + motivating)
  const quests = useMemo(() => {
    const awardedTodayCount = Object.values(rewards.awardedToday || {}).filter((d) => d === today).length

    const quickDone = safeChores.some(
      (c) => (c.estimateMinutes ?? 999) <= 15 && rewards.awardedToday?.[c.slug] === today
    )
      ? 1
      : 0

    const weeklyDone = safeChores.some(
      (c) => String(c.frequency ?? "").toLowerCase().includes("week") && rewards.awardedToday?.[c.slug] === today
    )
      ? 1
      : 0

    return [
      { label: "Daily", done: Math.min(awardedTodayCount, 3), total: 3 },
      { label: "Quick win", done: quickDone, total: 1 },
      { label: "Weekly", done: weeklyDone, total: 1 },
    ]
  }, [rewards.awardedToday, safeChores, today])

  function clearRewardToast() {
    setRewards((prev) => ({ ...prev, lastReward: null }))
  }

  function awardFor(chore: ChoreMeta) {
    setRewards((prev) => {
      const alreadyAwarded = prev.awardedToday?.[chore.slug] === today
      if (alreadyAwarded) {
        return {
          ...prev,
          lastReward: {
            slug: chore.slug,
            title: chore.title,
            xpGained: 0,
            leveledUp: false,
            newLevel: prev.level,
            message: "Already claimed today — still counts ✅",
          },
        }
      }

      const gained = xpForChore({
        estimateMinutes: chore.estimateMinutes,
        difficulty: chore.difficulty,
        frequency: chore.frequency,
      })

      const nextXp = (prev.xp ?? 0) + gained
      const nextLevel = levelFromXp(nextXp)
      const leveledUp = nextLevel > (prev.level ?? 1)

      const nextCompletionsByDate = { ...(prev.completionsByDate || {}) }
      nextCompletionsByDate[today] = (nextCompletionsByDate[today] ?? 0) + 1

      let nextState: RewardState = {
        ...prev,
        xp: nextXp,
        level: nextLevel,
        awardedToday: { ...(prev.awardedToday || {}), [chore.slug]: today },
        completionsByDate: nextCompletionsByDate,
        lastReward: {
          slug: chore.slug,
          title: chore.title,
          xpGained: gained,
          leveledUp,
          newLevel: nextLevel,
          message: leveledUp ? "Level up vibes ✨" : "Nice. Keep going 🔥",
        },
      }

      nextState = maybeUpdateStreak(nextState, today)
      nextState.achievements = evaluateAchievements(nextState)

      return nextState
    })
  }

  function markDone(chore: ChoreMeta) {
    const doneAt = Date.now()
    const repeatMs = Math.max(1, Number(chore.repeatHours ?? 168)) * 60 * 60 * 1000
    const nextDueAt = doneAt + repeatMs

    setDoneState((prev) => ({
      ...prev,
      [chore.slug]: { doneAt, nextDueAt },
    }))

    // Award XP + quests
    awardFor(chore)
  }

  function undo(chore: ChoreMeta) {
    setDoneState((prev) => {
      const next = { ...prev }
      delete next[chore.slug]
      return next
    })
  }

  function toggle(slug: string) {
    const chore = safeChores.find((c) => c.slug === slug)
    if (!chore) return
    const isDone = !!doneState[slug]
    if (isDone) undo(chore)
    else markDone(chore)
  }

  function resetChecklistOnly() {
    setDoneState({})
  }

  return (
    <main className="h-dvh overflow-hidden">
      <header className="sticky top-0 z-20 border-b border-border bg-[hsl(var(--background))/0.85] backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-2xl bg-primary shadow-soft" aria-hidden />
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-tight">ChoreFlow</div>
                <div className="text-xs text-muted-foreground leading-tight">
                  {doneCount}/{total} checked • Level {rewards.level}
                </div>
              </div>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={resetChecklistOnly} className="rounded-xl">
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>

        <div className="mx-auto max-w-3xl px-4 pb-3">
          <Progress value={pct} />
        </div>
      </header>

      <section className="mx-auto flex h-full max-w-3xl flex-col px-4 py-5">
        {/* ✅ Gamification HUD back on top */}
        <RewardDock rewards={rewards} onClearToast={clearRewardToast} quests={quests} />

        {/* Controls */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chores…"
              className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "h-10 rounded-xl border border-border bg-white px-3 text-sm text-foreground transition",
              "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-muted-foreground" />
              Filters
            </span>
          </button>
        </div>

        {showFilters ? (
          <div className="mt-3 rounded-2xl border border-border bg-white p-3">
            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["quick", "Quick (≤15m)"],
                ["daily", "Daily"],
                ["weekly", "Weekly"],
                ["biweekly", "Biweekly"],
                ["quarterly", "Quarterly"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k as any)}
                  className={cn(
                    "h-9 rounded-xl border border-border px-3 text-sm transition",
                    filter === k
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-white text-foreground hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* List */}
        <div className="mt-4 min-h-0 flex-1 overflow-auto pr-1">
  <div className="grid gap-2">
    {list.map((c) => {
      const info = doneState[c.slug]
      const remaining = info ? info.nextDueAt - now : null

      const xp = xpForChore({
        estimateMinutes: c.estimateMinutes,
        difficulty: c.difficulty,
        frequency: c.frequency,
      })

      return (
        <ChoreRow
          key={c.slug}
          chore={c}
          done={!!info}
          remainingMs={info ? Math.max(0, remaining ?? 0) : null}
          xp={xp}
          onToggle={() => toggle(c.slug)}
          onUndo={() => undo(c)}
        />
      )
    })}
  </div>
</div>

      </section>
    </main>
  )
}
