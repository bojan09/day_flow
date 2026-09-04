// Service: daySummary
// Purpose: Assemble the factual picture of a day for the evening review.
//
// The spec is explicit that this is context, not judgment: "Do not turn this
// into a performance score." So this returns plain counts with no total, no
// grade and no percentage — the UI states what happened and stops there.
//
// Pure, so the counting rules can be tested without React.

/**
 * @param {object}   args
 * @param {object}   args.tasks       useTasks-shaped API
 * @param {object}   args.habits      useHabits-shaped API
 * @param {Array}    args.routines    routine list (optional)
 * @param {Array}    args.focusSessions today's pomodoro sessions (optional)
 * @param {object}   args.reflection  today's reflection entry (optional)
 * @param {string}   args.dateKey
 */
export function buildDaySummary({ tasks, habits, routines, focusSessions, fastingRecords, reflection, dateKey }) {
  const dayTasks  = (tasks?.tasks || []).filter(t => t.date === dateKey)
  const completed = dayTasks.filter(t => t.completed).length

  const habitList  = habits?.habits || []
  const habitsDone = habitList.filter(h => habits?.isHabitDone?.(h.id, dateKey)).length

  const routineList = Array.isArray(routines) ? routines : (routines?.routines || [])

  // Was the morning's stated priority actually finished? Only answerable when
  // the priority was linked to a real task.
  let priorityDone = null
  if (reflection?.priorityTaskId) {
    const t = (tasks?.tasks || []).find(x => x.id === reflection.priorityTaskId)
    priorityDone = t ? !!t.completed : null
  }

  // Fasting appears in the evening summary when it happened, and is simply
  // absent otherwise — the spec lists it as one context line, not a fixture.
  const fastToday = Array.isArray(fastingRecords)
    ? fastingRecords.find(r => r.dateKey === dateKey)
    : null

  return {
    tasks:    { completed, total: dayTasks.length },
    habits:   { completed: habitsDone, total: habitList.length },
    routines: { total: routineList.length },
    fastingMs: fastToday?.actualMs || 0,
    focusSessions: Array.isArray(focusSessions) ? focusSessions.length : 0,
    focusMinutes:  Array.isArray(focusSessions)
      ? focusSessions.reduce((sum, s) => sum + (s.mins || s.minutes || 0), 0)
      : 0,
    priority: reflection?.priorityText || '',
    priorityDone,
  }
}

/** Human-readable lines for the "your day" panel. Empty categories are skipped
 *  rather than shown as zeros, which would read like a scorecard. */
export function summaryLines(summary) {
  const lines = []
  if (summary.tasks.total > 0) {
    lines.push({ label: 'Tasks completed', value: `${summary.tasks.completed} / ${summary.tasks.total}` })
  }
  if (summary.focusSessions > 0) {
    lines.push({
      label: 'Focus sessions',
      value: summary.focusMinutes
        ? `${summary.focusSessions} · ${summary.focusMinutes}m`
        : String(summary.focusSessions),
    })
  }
  if (summary.habits.total > 0) {
    lines.push({ label: 'Habits', value: `${summary.habits.completed} / ${summary.habits.total}` })
  }
  if (summary.fastingMs > 0) {
    const mins = Math.floor(summary.fastingMs / 60000)
    lines.push({ label: 'Fasting', value: `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m` })
  }
  if (summary.priority) {
    lines.push({
      label: 'Your priority',
      value: summary.priorityDone === null
        ? summary.priority
        : `${summary.priority} — ${summary.priorityDone ? 'done' : 'not finished'}`,
    })
  }
  return lines
}

/**
 * Whether there is enough real material to ask the AI for a reflection.
 * The spec: "If there is insufficient context for a meaningful insight: do not
 * generate one. Silence is better than generic AI filler."
 *
 * Requires something the user actually wrote — the AI reflects on their words,
 * it does not invent a day for them.
 */
export function hasEnoughContextForAI(summary, entry) {
  const written = [entry?.wentWell, entry?.didntGoPlanned, entry?.lesson, entry?.differently]
    .filter(v => v && String(v).trim().length >= 8)
  if (written.length === 0) return false

  const hasDayData = summary.tasks.total > 0 || summary.habits.total > 0 || summary.focusSessions > 0
  return hasDayData || written.length >= 2
}
