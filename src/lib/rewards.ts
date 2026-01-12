export type Difficulty = "Easy" | "Medium" | "Hard"

export type RewardState = {
  xp: number
  level: number
  streakDays: number
  lastStreakDate: string | null // YYYY-MM-DD
  completionsByDate: Record<string, number> // YYYY-MM-DD -> count completed that day (awarded)
  awardedToday: Record<string, string> // slug -> YYYY-MM-DD (prevents double-award per day)
  achievements: Record<string, boolean>
  lastReward?: {
    slug: string
    title: string
    xpGained: number
    leveledUp: boolean
    newLevel: number
    message: string
  } | null
}

export const DEFAULT_REWARDS: RewardState = {
  xp: 0,
  level: 1,
  streakDays: 0,
  lastStreakDate: null,
  completionsByDate: {},
  awardedToday: {},
  achievements: {},
  lastReward: null,
}

export function todayKey(d = new Date()) {
  // Local date key
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function xpForChore(args: {
  estimateMinutes: number
  difficulty: Difficulty
  frequency: string
}) {
  const mins = Math.max(1, Math.min(180, Number(args.estimateMinutes ?? 10)))

  const diffBonus =
    args.difficulty === "Easy" ? 5 : args.difficulty === "Medium" ? 15 : 30

  // Small nudge to reward “weekly/monthly” chores a bit more
  const freq = (args.frequency || "").toLowerCase()
  const freqBonus =
    freq.includes("month") ? 20 : freq.includes("week") ? 10 : 0

  // Reward function:
  // - base 10
  // - minutes contribute up to ~50 XP
  // - difficulty and frequency bonuses
  const xp = Math.round(10 + mins * 0.7 + diffBonus + freqBonus)
  return Math.max(10, Math.min(120, xp))
}

export function levelFromXp(totalXp: number) {
  // 250 XP per level
  return Math.max(1, Math.floor(totalXp / 250) + 1)
}

export function xpToNextLevel(totalXp: number) {
  const level = levelFromXp(totalXp)
  const nextAt = level * 250
  return Math.max(0, nextAt - totalXp)
}

export function progressToNextLevel(totalXp: number) {
  const level = levelFromXp(totalXp)
  const prevAt = (level - 1) * 250
  const nextAt = level * 250
  const within = totalXp - prevAt
  const span = nextAt - prevAt
  return Math.round((within / span) * 100)
}

export function evaluateAchievements(state: RewardState) {
  const ach = { ...state.achievements }

  const totalCompletions = Object.values(state.completionsByDate).reduce((a, b) => a + b, 0)

  if (totalCompletions >= 1) ach["first_chore"] = true
  if (totalCompletions >= 10) ach["ten_chores"] = true
  if (totalCompletions >= 50) ach["fifty_chores"] = true
  if (state.streakDays >= 7) ach["seven_day_streak"] = true
  if (state.streakDays >= 21) ach["twentyone_day_streak"] = true
  if (state.level >= 5) ach["level_5"] = true
  if (state.level >= 10) ach["level_10"] = true

  return ach
}

export function maybeUpdateStreak(state: RewardState, dayKey: string) {
  // streak is based on “days where you completed at least 3 chores”
  const didEnough = (state.completionsByDate[dayKey] ?? 0) >= 3
  if (!didEnough) return state

  const last = state.lastStreakDate
  if (!last) {
    return { ...state, streakDays: 1, lastStreakDate: dayKey }
  }

  // Compare dates (YYYY-MM-DD safe lexicographically if same format)
  const lastDate = new Date(last + "T00:00:00")
  const curDate = new Date(dayKey + "T00:00:00")
  const diffDays = Math.round((curDate.getTime() - lastDate.getTime()) / 86400000)

  if (diffDays === 0) return state // already counted today
  if (diffDays === 1) return { ...state, streakDays: state.streakDays + 1, lastStreakDate: dayKey }

  // Streak broken
  return { ...state, streakDays: 1, lastStreakDate: dayKey }
}
