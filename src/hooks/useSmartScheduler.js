// Hook: useSmartScheduler
// Purpose: Analyses the user's task backlog, schedule gaps, completion patterns,
//          and energy data to build context for AI scheduling suggestions.
import { useMemo } from 'react'
import { format, addDays, subDays, isWeekend } from 'date-fns'
import { getTodayKey, getDateKey } from '../utils/dateUtils'
import { callClaude } from '../services/aiService'
import { getNextAction } from '../services/nextAction'

const SCHEDULE_SYSTEM_PROMPT = `You suggest which day (YYYY-MM-DD, within the next 7 days) an overdue or
unscheduled task should be rescheduled to, given the user's upcoming task load per day and optional energy
context. Respond with ONLY a JSON array, no prose: [{"taskId": "...", "suggestedDate": "YYYY-MM-DD", "reason": "short human-readable reason"}].`

// ── On-demand AI scheduling suggestions ─────────────────────────────────────
// Not part of the useMemo above — this is an explicit async action triggered
// by the user (e.g. a button press), not a value derived on every render.
export async function getAIScheduleSuggestions(tasksToSchedule, next7Days, todayEnergy) {
  const context = JSON.stringify({
    tasks: (tasksToSchedule || []).map(t => ({ id: t.id, title: t.title, priority: t.priority, estimateMins: t.estimateMins })),
    upcomingLoad: (next7Days || []).map(d => ({
      date:     d?.dateKey,
      totalMins: d?.totalMins,
      isHeavy:   d?.isHeavy,
      isLight:   d?.isLight,
    })),
    todayEnergy: todayEnergy || null,
  })
  try {
    const raw = await callClaude(SCHEDULE_SYSTEM_PROMPT, context)
    const parsed = JSON.parse(raw.trim())
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useSmartScheduler({ tasks, energy, habits, dailyPriorityIds = [], projects = [] }) {
  const today = getTodayKey()

  const analysis = useMemo(() => {
    // ── Overdue tasks ──────────────────────────────────────────────────────
    const overdue = tasks.tasks.filter(t =>
      !t.completed && t.date && t.date < today
    ).sort((a, b) => a.date.localeCompare(b.date))

    // ── Unscheduled tasks (no date) ────────────────────────────────────────
    const unscheduled = tasks.tasks.filter(t =>
      !t.completed && !t.date
    )

    // ── Next 7 days workload ───────────────────────────────────────────────
    const next7 = Array.from({ length: 7 }, (_, i) => {
      const d       = addDays(new Date(), i)
      const dateKey = getDateKey(d)
      const dayTasks = tasks.tasks.filter(t => t.date === dateKey && !t.completed)
      const totalMins = dayTasks.reduce((s, t) => s + (t.estimateMins || 30), 0)
      return {
        dateKey,
        label:     format(d, 'EEE MMM d'),
        isToday:   dateKey === today,
        isWeekend: isWeekend(d),
        taskCount: dayTasks.length,
        totalMins,
        isLight:   dayTasks.length < 3,
        isHeavy:   totalMins > 240 || dayTasks.length > 7,
        tasks:     dayTasks.map(t => ({
          title:    t.title,
          priority: t.priority,
          estimate: t.estimateMins,
        })),
      }
    })

    // ── Best focus days (gaps available for scheduling) ────────────────────
    const lightDays = next7.filter(d => d.isLight && !d.isToday)
    const heavyDays = next7.filter(d => d.isHeavy)

    // ── Completion rate trend (last 14 days) ──────────────────────────────
    const last14 = Array.from({ length: 14 }, (_, i) => {
      const d       = subDays(new Date(), 13 - i)
      const dateKey = getDateKey(d)
      const dayTasks = tasks.tasks.filter(t => t.date === dateKey)
      const done     = dayTasks.filter(t => t.completed).length
      return { dateKey, pct: dayTasks.length > 0 ? Math.round((done / dayTasks.length) * 100) : null }
    }).filter(d => d.pct !== null)

    const avgCompletion = last14.length > 0
      ? Math.round(last14.reduce((s, d) => s + d.pct, 0) / last14.length)
      : null

    // ── Today's energy window ─────────────────────────────────────────────
    const todayEnergy = energy?.getTodayEnergy?.()

    // ── Priority distribution ─────────────────────────────────────────────
    const activeTasks = tasks.tasks.filter(t => !t.completed)
    const byPriority = {
      high:   activeTasks.filter(t => t.priority === 'high').length,
      medium: activeTasks.filter(t => t.priority === 'medium').length,
      low:    activeTasks.filter(t => t.priority === 'low').length,
    }

    const topRecommendation = getNextAction(tasks.tasks, {
      now: new Date(),
      dailyPriorityIds,
      projects: projects.projects ?? projects,
    })

    return {
      overdue,
      unscheduled,
      next7,
      lightDays,
      heavyDays,
      avgCompletion,
      todayEnergy,
      byPriority,
      topRecommendation,
      activeTasks: activeTasks.length,
    }
  }, [tasks.tasks, energy?.level, today, dailyPriorityIds, projects])

  // ── Build context string for AI ───────────────────────────────────────────
  const buildAIContext = () => {
    const { overdue, unscheduled, next7, avgCompletion, todayEnergy, byPriority } = analysis

    return `
SCHEDULING CONTEXT (${format(new Date(), 'EEEE, MMM d, yyyy')}):

BACKLOG:
- Overdue tasks: ${overdue.length} (${overdue.slice(0, 3).map(t => `"${t.title}"`).join(', ')}${overdue.length > 3 ? '…' : ''})
- Unscheduled tasks: ${unscheduled.length}
- Priority breakdown: ${byPriority.high} high, ${byPriority.medium} medium, ${byPriority.low} low

NEXT 7 DAYS:
${next7.map(d => `- ${d.label}: ${d.taskCount} tasks (~${d.totalMins}min)${d.isHeavy ? ' ⚠️ heavy' : d.isLight ? ' ✓ light' : ''}`).join('\n')}

PATTERNS:
- 14-day avg completion: ${avgCompletion !== null ? `${avgCompletion}%` : 'not enough data'}
- Peak energy window today: ${todayEnergy ? todayEnergy.window : 'not logged'}
`.trim()
  }

  return { analysis, buildAIContext }
}
