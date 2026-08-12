export const NEXT_ACTION_WEIGHTS = Object.freeze({
  pinned: 120,
  dailyPriority: 80,
  overdue: 70,
  overdueAgeMax: 20,
  dueToday: 60,
  priority: Object.freeze({ high: 35, medium: 15, low: 0 }),
  scheduledWithin60: 40,
  scheduledWithin180: 25,
  started: 20,
  estimateShort: 12,
  estimateMedium: 5,
  projectDue: 15,
  futurePerDay: -25,
  futureMaxPenalty: -100,
})

const DAY_MS = 86_400_000

function localDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
  if (date.getFullYear() !== Number(match[1]) || date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) return null
  return date
}

function dayStart(value) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12).getTime()
}

function daysBetween(from, to) {
  return Math.round((dayStart(to) - dayStart(from)) / DAY_MS)
}

function scheduledAt(task) {
  const date = localDate(task.date)
  if (!date) return null
  const match = /^(\d{1,2}):(\d{2})$/.exec(task.dueTime ?? task.time ?? '')
  if (!match) return date.getTime()
  const hours = Number(match[1]); const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return date.getTime()
  date.setHours(hours, minutes, 0, 0)
  return date.getTime()
}

function addReason(reasons, code, label, score) {
  if (score !== 0) reasons.push({ code, label, score })
}

export function scoreTask(task, context) {
  if (!task || task.completed || (task.isRecurring && task.recurStatus === 'paused')) return null

  const now = context.now instanceof Date ? context.now : new Date(context.now ?? Date.now())
  const taskDate = localDate(task.date)
  const dayDelta = taskDate ? daysBetween(now, taskDate) : null
  const reasons = []

  if (task.isFocus) addReason(reasons, 'pinned', 'Pinned focus task', NEXT_ACTION_WEIGHTS.pinned)
  if (context.dailyPriorityIds?.includes(String(task.id))) {
    addReason(reasons, 'daily-priority', 'In your Daily Big 3', NEXT_ACTION_WEIGHTS.dailyPriority)
  }

  if (dayDelta !== null && dayDelta < 0) {
    const ageBonus = Math.min(Math.abs(dayDelta) * 2, NEXT_ACTION_WEIGHTS.overdueAgeMax)
    addReason(reasons, 'overdue', `${Math.abs(dayDelta)} day${dayDelta === -1 ? '' : 's'} overdue`, NEXT_ACTION_WEIGHTS.overdue + ageBonus)
  } else if (dayDelta === 0) {
    addReason(reasons, 'due-today', 'Due today', NEXT_ACTION_WEIGHTS.dueToday)
  } else if (dayDelta !== null && dayDelta > 0) {
    addReason(reasons, 'future', `Scheduled in ${dayDelta} days`, Math.max(NEXT_ACTION_WEIGHTS.futureMaxPenalty, dayDelta * NEXT_ACTION_WEIGHTS.futurePerDay))
  }

  const priorityScore = NEXT_ACTION_WEIGHTS.priority[task.priority] ?? NEXT_ACTION_WEIGHTS.priority.medium
  addReason(reasons, 'priority', `${task.priority ?? 'medium'} priority`, priorityScore)

  const timestamp = scheduledAt(task)
  if (timestamp !== null && dayDelta === 0 && task.dueTime) {
    const minutesAway = (timestamp - now.getTime()) / 60_000
    if (minutesAway >= 0 && minutesAway <= 60) addReason(reasons, 'scheduled-soon', 'Scheduled within an hour', NEXT_ACTION_WEIGHTS.scheduledWithin60)
    else if (minutesAway > 60 && minutesAway <= 180) addReason(reasons, 'scheduled-soon', 'Scheduled within three hours', NEXT_ACTION_WEIGHTS.scheduledWithin180)
  }

  if (task.startedAt || task.inProgress || Number(task.elapsedMins) > 0) {
    addReason(reasons, 'started', 'Already started', NEXT_ACTION_WEIGHTS.started)
  }

  const estimate = Number(task.estimateMins ?? task.customMins)
  if (estimate >= 5 && estimate <= 45) addReason(reasons, 'short', `About ${estimate} minutes`, NEXT_ACTION_WEIGHTS.estimateShort)
  else if (estimate > 45 && estimate <= 90) addReason(reasons, 'medium-length', `About ${estimate} minutes`, NEXT_ACTION_WEIGHTS.estimateMedium)

  const project = context.projects?.find(item => String(item.id) === String(task.projectId))
  const projectDue = localDate(project?.dueDate ?? project?.targetDate)
  const projectDays = projectDue ? daysBetween(now, projectDue) : null
  if (project && String(project.status).toLowerCase() === 'active' && projectDays !== null && projectDays >= 0 && projectDays <= 7) {
    addReason(reasons, 'project-due', 'Active project due soon', NEXT_ACTION_WEIGHTS.projectDue)
  }

  reasons.sort((a, b) => Math.abs(b.score) - Math.abs(a.score) || a.code.localeCompare(b.code))
  return { score: reasons.reduce((sum, reason) => sum + reason.score, 0), reasons }
}

export function rankNextActions(tasks, context) {
  return (tasks ?? []).flatMap(task => {
    const result = scoreTask(task, context)
    return result ? [{ task, ...result }] : []
  }).sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score
    const aTime = scheduledAt(a.task) ?? Number.POSITIVE_INFINITY
    const bTime = scheduledAt(b.task) ?? Number.POSITIVE_INFINITY
    if (aTime !== bTime) return aTime - bTime
    const created = String(a.task.createdAt ?? '').localeCompare(String(b.task.createdAt ?? ''))
    return created || String(a.task.id).localeCompare(String(b.task.id))
  })
}

export function getNextAction(tasks, context) {
  return rankNextActions(tasks, context)[0] ?? null
}
