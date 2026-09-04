// Hook: useAdaptiveDashboard
// Purpose: Derive the current "context" (time of day, user state, priority nudges)
//          so the Today tab can surface the most relevant widgets first.
import { useMemo } from 'react'
import { getTodayKey } from '../utils/dateUtils'
import { subDays } from 'date-fns'
import { getDateKey } from '../utils/dateUtils'

export const TIME_CONTEXTS = {
  EARLY_MORNING: 'early_morning',  // 5–8
  MORNING:       'morning',        // 8–12
  AFTERNOON:     'afternoon',      // 12–17
  EVENING:       'evening',        // 17–21
  NIGHT:         'night',          // 21–5
}

function getTimeContext(hour = new Date().getHours()) {
  if (hour >= 5  && hour < 8)  return TIME_CONTEXTS.EARLY_MORNING
  if (hour >= 8  && hour < 12) return TIME_CONTEXTS.MORNING
  if (hour >= 12 && hour < 17) return TIME_CONTEXTS.AFTERNOON
  if (hour >= 17 && hour < 21) return TIME_CONTEXTS.EVENING
  return TIME_CONTEXTS.NIGHT
}

const CONTEXT_META = {
  early_morning: { greeting: 'Rise and shine',    emoji: '🌄', desc: 'Great time to plan your day' },
  morning:       { greeting: 'Good morning',       emoji: '☀️', desc: 'Peak focus window'           },
  afternoon:     { greeting: 'Good afternoon',     emoji: '🌤', desc: 'Stay on track'               },
  evening:       { greeting: 'Good evening',       emoji: '🌆', desc: 'Wind down with purpose'      },
  night:         { greeting: 'Good night',         emoji: '🌙', desc: 'Rest and recover'            },
}

export function useAdaptiveDashboard({ tasks, habits, mood, energy }) {
  const context = getTimeContext()
  const meta    = CONTEXT_META[context]
  const today   = getTodayKey()

  // ── Derived state ──────────────────────────────────────────────────────────

  const todayTasks     = tasks.getTodayTasks()
  const completedToday = todayTasks.filter(t => t.completed).length
  const totalToday     = todayTasks.length
  const taskPct        = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0
  const habitPct       = habits.getTodayCompletion()
  const todayMood      = mood.getTodayMood?.() ?? null
  const todayEnergy    = energy.getTodayEnergy?.() ?? null

  // ── Overdue tasks ──────────────────────────────────────────────────────────
  const overdue = tasks.tasks.filter(t => tasks.isOverdue(t)).length

  // ── Streak health (last 7 days of any habit done) ──────────────────────────
  const last7 = Array.from({ length: 7 }, (_, i) => getDateKey(subDays(new Date(), i)))
  const activeDays = last7.filter(d =>
    habits.habits.some(h => habits.isHabitDone(h.id, d))
  ).length
  const streakHealth = Math.round((activeDays / 7) * 100)

  // ── Smart nudges — context-aware suggestions ───────────────────────────────
  const nudges = useMemo(() => {
    const list = []

    if (!todayMood && (context === TIME_CONTEXTS.MORNING || context === TIME_CONTEXTS.AFTERNOON)) {
      list.push({ id: 'log_mood', priority: 1, type: 'mood',
        message: 'Log your mood to track patterns over time', action: 'Log mood', tab: null })
    }

    if (overdue > 0) {
      list.push({ id: 'overdue', priority: 2, type: 'warning',
        message: `${overdue} overdue task${overdue > 1 ? 's' : ''} need attention`, action: 'Review', tab: 'tasks' })
    }

    if (taskPct === 100 && totalToday > 0) {
      list.push({ id: 'all_done', priority: 0, type: 'success',
        message: '🎉 All tasks done — outstanding day!', action: null, tab: null })
    }

    if (context === TIME_CONTEXTS.EVENING && habitPct < 50 && habits.habits.length > 0) {
      list.push({ id: 'habits_low', priority: 2, type: 'nudge',
        message: `Habits at ${habitPct}% — still time to close the gap`, action: 'Log habits', tab: 'habits' })
    }

    if (context === TIME_CONTEXTS.EVENING && !tasks.tasks.some(t => t.date > today)) {
      list.push({ id: 'plan_tomorrow', priority: 3, type: 'nudge',
        message: 'No tasks set for tomorrow yet', action: 'Plan tomorrow', tab: 'tasks' })
    }

    if (streakHealth < 50 && habits.habits.length > 0) {
      list.push({ id: 'streak_risk', priority: 3, type: 'warning',
        message: 'Habit activity dropped this week — time to rebuild', action: 'View habits', tab: 'habits' })
    }

    return list.sort((a, b) => a.priority - b.priority).slice(0, 3)
  // Keyed on the counts that actually affect the layout, not whole arrays.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, todayMood, overdue, taskPct, totalToday, habitPct, streakHealth, today])

  // ── Widget priority order based on context ─────────────────────────────────
  const widgetOrder = useMemo(() => {
    const base = ['intention', 'affirmations', 'mood', 'energy', 'focus', 'progress', 'tasks', 'habits', 'water', 'gratitude', 'score', 'eod']
    if (context === TIME_CONTEXTS.EARLY_MORNING || context === TIME_CONTEXTS.MORNING) {
      return ['intention', 'affirmations', 'mood', 'energy', 'focus', 'progress', 'tasks', 'habits', 'water', 'gratitude', 'score', 'eod']
    }
    if (context === TIME_CONTEXTS.AFTERNOON) {
      return ['focus', 'tasks', 'progress', 'habits', 'mood', 'water', 'intention', 'gratitude', 'score', 'eod']
    }
    if (context === TIME_CONTEXTS.EVENING || context === TIME_CONTEXTS.NIGHT) {
      return ['progress', 'habits', 'gratitude', 'mood', 'water', 'score', 'eod', 'tasks', 'focus', 'intention']
    }
    return base
  }, [context])

  return {
    context,
    meta,
    taskPct,
    habitPct,
    completedToday,
    totalToday,
    overdue,
    streakHealth,
    todayMood,
    todayEnergy,
    nudges,
    widgetOrder,
  }
}
