export function isQuietTime(localTime, start, end) {
  if (start === end) return false
  return start < end
    ? localTime >= start && localTime < end
    : localTime >= start || localTime < end
}

export function dailySendAllowed({ sentToday = 0, sentLastHour = 0, explicit = false }) {
  return explicit || (sentToday < 3 && sentLastHour < 1)
}

export function buildNotificationCandidates({ preferences, tasks = [], now = new Date() }) {
  if (!preferences?.enabled) return []

  return tasks
    .filter(task => (
      !task.completed &&
      task.reminder_at &&
      new Date(task.reminder_at) <= now &&
      !task.reminder_sent
    ))
    .map(task => ({
      category: 'task_reminder',
      sourceType: 'task',
      sourceId: task.id,
      logicalKey: `task:${task.id}:${task.reminder_at}`,
      title: 'Task reminder',
      body: task.title,
      url: `/tasks/${encodeURIComponent(task.id)}`,
      explicit: true,
    }))
}

function localParts(now, timezone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone || 'UTC',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).filter(part => part.type !== 'literal').map(part => [part.type, part.value]))
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

function clockMinutes(value = '00:00') {
  const [hours, minutes] = String(value).slice(0, 5).split(':').map(Number)
  return hours * 60 + minutes
}

function inWindow(current, target, width = 10) {
  const difference = current - clockMinutes(target)
  return difference >= 0 && difference < width
}

function candidate(category, logicalKey, title, body, url, sourceType, sourceId) {
  return { category, logicalKey, title, body, url, sourceType, sourceId, explicit: false }
}

export function buildContextualCandidates({
  preferences,
  tasks = [],
  habits = [],
  habitLog = [],
  routines = [],
  routineLog = {},
  focusSession = null,
  dailyPriorities = {},
  now = new Date(),
}) {
  if (!preferences?.enabled) return []
  const local = localParts(now, preferences.timezone)
  if (isQuietTime(local.time, String(preferences.quiet_start ?? '22:00').slice(0, 5), String(preferences.quiet_end ?? '07:00').slice(0, 5))) return []

  const openTasks = tasks.filter(task => !task.completed)
  const rows = []
  const morning = inWindow(local.minutes, preferences.morning_time ?? '08:00')
  const evening = inWindow(local.minutes, preferences.evening_time ?? '20:00')
  const priorityIds = dailyPriorities?.[local.date] ?? []

  if (preferences.morning_planning && morning && priorityIds.length === 0) {
    rows.push(candidate('morning_planning', `morning:${local.date}`, 'Plan your day', "Choose what matters most today.", '/day'))
  }

  if (preferences.upcoming_tasks) {
    for (const task of openTasks) {
      if (task.date !== local.date || !task.due_time) continue
      const startsIn = clockMinutes(task.due_time) - local.minutes
      if (startsIn >= 0 && startsIn <= 15) {
        rows.push(candidate('upcoming_task', `upcoming:${task.id}:${local.date}:${String(task.due_time).slice(0, 5)}`, 'Coming up', `${task.title} starts in ${startsIn || 'less than 1'} minute${startsIn === 1 ? '' : 's'}.`, `/tasks/${encodeURIComponent(task.id)}`, 'task', task.id))
      }
    }
  }

  const overdue = openTasks.filter(task => task.date && task.date < local.date)
  if (preferences.overdue_summary && morning && overdue.length) {
    rows.push(candidate('overdue_summary', `overdue:${local.date}`, 'A small reset', `${overdue.length} overdue task${overdue.length === 1 ? '' : 's'} can be reviewed without pressure.`, '/day'))
  }

  const completedHabits = new Set(habitLog.filter(row => row.date_key === local.date && row.done).map(row => String(row.habit_id)))
  const pendingHabits = habits.filter(habit => !completedHabits.has(String(habit.id)))
  if (preferences.habit_reminders && morning && pendingHabits.length) {
    rows.push(candidate('habit_reminder', `habits:${local.date}`, 'Habits for today', `${pendingHabits.length} habit${pendingHabits.length === 1 ? '' : 's'} ready when you are.`, '/habits'))
  }

  const routinePeriod = morning ? 'morning' : evening ? 'evening' : null
  const pendingRoutines = routinePeriod ? routines.filter(routine => {
    if (routine.time !== routinePeriod || !routine.steps?.length) return false
    const completed = routineLog[`${routine.id}_${local.date}`] ?? {}
    return routine.steps.some(step => !completed[step.id])
  }) : []
  if (preferences.routine_reminders && pendingRoutines.length) {
    rows.push(candidate('routine_reminder', `routines:${routinePeriod}:${local.date}`, `${routinePeriod === 'morning' ? 'Morning' : 'Evening'} routine`, `${pendingRoutines.length} routine${pendingRoutines.length === 1 ? '' : 's'} still open.`, '/routines'))
  }

  if (preferences.focus_reminders && focusSession?.status === 'paused' && Number.isFinite(focusSession.lastTransitionAt)) {
    const pausedMinutes = (now.getTime() - focusSession.lastTransitionAt) / 60000
    if (pausedMinutes >= 15 && focusSession.taskId) {
      rows.push(candidate('focus_reminder', `focus:${focusSession.taskId}:${focusSession.lastTransitionAt}`, 'Ready to continue?', 'Your paused focus session is waiting.', `/focus/${encodeURIComponent(focusSession.taskId)}`, 'task', focusSession.taskId))
    }
  }

  const unfinishedToday = openTasks.filter(task => task.date === local.date)
  if (preferences.evening_review && evening && unfinishedToday.length) {
    rows.push(candidate('evening_review', `evening:${local.date}`, 'Close your day', `${unfinishedToday.length} unfinished task${unfinishedToday.length === 1 ? '' : 's'} can be reviewed or rescheduled.`, '/day'))
  }

  const lastOpenedDate = preferences.last_opened_at ? localParts(new Date(preferences.last_opened_at), preferences.timezone).date : null
  if (preferences.inactivity_nudges && lastOpenedDate && lastOpenedDate < local.date && evening) {
    rows.push(candidate('inactivity_nudge', `inactive:${local.date}`, 'DayFlow is ready', "You haven't planned here today.", '/day'))
  }

  return rows
}

export function toDeliveryRow(userId, candidate) {
  return {
    user_id: userId,
    logical_key: candidate.logicalKey,
    category: candidate.category,
    source_type: candidate.sourceType,
    source_id: candidate.sourceId,
    bucket: candidate.logicalKey.split(':').at(-1),
    title: candidate.title,
    body: candidate.body,
    url: candidate.url,
  }
}

export function buildOneSignalPayload({ userId, title, body, url, idempotencyKey, appId }) {
  return {
    app_id: appId,
    include_aliases: { external_id: [userId] },
    target_channel: 'push',
    headings: { en: title },
    contents: { en: body },
    url,
    idempotency_key: idempotencyKey,
  }
}
