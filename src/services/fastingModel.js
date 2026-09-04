// Service: fastingModel
// Purpose: Pure logic for the fasting tracker — plans, the running fast, and
//          history/streaks.
//
// The spec is emphatic that the timer must survive navigation, refresh, the
// PWA being minimised, the device sleeping and the user returning hours later,
// and that it must NOT be a counter the frontend increments. So a running fast
// is stored as timestamps and every figure is derived from the clock.

export const PRESETS = [
  { id: '12:12', label: '12:12', fastHours: 12, note: 'Gentle daily rhythm' },
  { id: '14:10', label: '14:10', fastHours: 14, note: 'A common starting point' },
  { id: '16:8',  label: '16:8',  fastHours: 16, note: 'The most widely used window' },
  { id: '18:6',  label: '18:6',  fastHours: 18, note: 'Longer daily fast' },
  { id: '20:4',  label: '20:4',  fastHours: 20, note: 'Short eating window' },
  { id: 'omad',  label: 'OMAD',  fastHours: 23, note: 'One meal a day' },
]

export const FEELINGS = ['Easy', 'Steady', 'Hungry', 'Tough']

export const MS_HOUR = 3600_000

/**
 * A plan is the schedule. It is NOT the challenge length — the spec calls out
 * that confusion explicitly: 16:8 means fast 16 hours in each daily cycle,
 * while a 30-day challenge means following that schedule for 30 days.
 */
export function makePlan({ presetId = '16:8', fastHours, challengeDays = null } = {}) {
  const preset = PRESETS.find(p => p.id === presetId)
  const hours  = Number(fastHours ?? preset?.fastHours ?? 16)
  return {
    presetId: preset ? preset.id : 'custom',
    fastHours: hours,
    eatHours: Math.max(0, 24 - hours),
    challengeDays: challengeDays ? Number(challengeDays) : null,
    createdAt: new Date().toISOString(),
  }
}

/** Start a fast now (or at an explicit time, for "I actually started at 8pm"). */
export function startFast(plan, startedAtMs = Date.now()) {
  const hours = plan?.fastHours ?? 16
  return {
    startedAt: startedAtMs,
    targetEndsAt: startedAtMs + hours * MS_HOUR,
    targetHours: hours,
    presetId: plan?.presetId ?? 'custom',
  }
}

/**
 * Everything the dashboard needs, derived from timestamps at the moment of
 * asking — never accumulated.
 */
export function fastProgress(fast, nowMs = Date.now()) {
  if (!fast?.startedAt) return null
  const elapsedMs   = Math.max(0, nowMs - fast.startedAt)
  const targetMs    = Math.max(1, (fast.targetEndsAt ?? fast.startedAt) - fast.startedAt)
  const remainingMs = Math.max(0, fast.targetEndsAt - nowMs)
  return {
    elapsedMs,
    remainingMs,
    targetMs,
    // Can exceed 100% — going past the target is a fine thing to do, and the
    // UI shows it rather than silently clamping the user's actual effort.
    percent: Math.round((elapsedMs / targetMs) * 100),
    reachedTarget: nowMs >= fast.targetEndsAt,
  }
}

/** "14h 32m" — the dashboard's primary figure. */
export function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 60000))
  const h = Math.floor(total / 60)
  const m = total % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

/** Close a running fast into a history record (spec section 12). */
export function completeFast(fast, { endedAtMs = Date.now(), note = '', feeling = '' } = {}) {
  const actualMs = Math.max(0, endedAtMs - fast.startedAt)
  const targetMs = Math.max(0, fast.targetEndsAt - fast.startedAt)
  return {
    id: `${fast.startedAt}`,
    dateKey: new Date(fast.startedAt).toISOString().slice(0, 10),
    startedAt: fast.startedAt,
    endedAt: endedAtMs,
    targetHours: fast.targetHours,
    actualMs,
    // Reaching the target is what "completed" means; stopping earlier is
    // recorded plainly, never as a failure.
    completed: actualMs >= targetMs,
    presetId: fast.presetId,
    note,
    feeling,
  }
}

/**
 * Consecutive days with a recorded fast, ending today or yesterday.
 * Counts any recorded fast, not only ones that hit target — the spec asks for
 * neutral consistency tracking, not pressure.
 */
export function fastingStreak(records = [], todayKey = new Date().toISOString().slice(0, 10)) {
  const days = new Set(records.map(r => r.dateKey))
  const step = (key) => {
    const [y, m, d] = key.split('-').map(Number)
    const dt = new Date(Date.UTC(y, m - 1, d))
    dt.setUTCDate(dt.getUTCDate() - 1)
    return dt.toISOString().slice(0, 10)
  }
  let cursor = todayKey
  // Not having fasted yet today shouldn't erase an existing run.
  if (!days.has(cursor)) cursor = step(cursor)
  let streak = 0
  while (days.has(cursor)) { streak++; cursor = step(cursor) }
  return streak
}

export function fastingStats(records = [], todayKey = new Date().toISOString().slice(0, 10)) {
  const month = todayKey.slice(0, 7)
  const year  = todayKey.slice(0, 4)
  const totalMs = records.reduce((sum, r) => sum + (r.actualMs || 0), 0)
  const longest = records.reduce((max, r) => Math.max(max, r.actualMs || 0), 0)
  return {
    totalFasts: records.length,
    completedFasts: records.filter(r => r.completed).length,
    daysThisMonth: records.filter(r => r.dateKey?.startsWith(month)).length,
    daysThisYear:  records.filter(r => r.dateKey?.startsWith(year)).length,
    averageMs: records.length ? Math.round(totalMs / records.length) : 0,
    longestMs: longest,
    currentStreak: fastingStreak(records, todayKey),
    longestStreak: longestStreakOf(records),
  }
}

function longestStreakOf(records = []) {
  const days = [...new Set(records.map(r => r.dateKey))].sort()
  let best = 0, run = 0, prev = null
  for (const day of days) {
    if (prev) {
      const [y, m, d] = prev.split('-').map(Number)
      const dt = new Date(Date.UTC(y, m - 1, d))
      dt.setUTCDate(dt.getUTCDate() + 1)
      run = dt.toISOString().slice(0, 10) === day ? run + 1 : 1
    } else run = 1
    best = Math.max(best, run)
    prev = day
  }
  return best
}
