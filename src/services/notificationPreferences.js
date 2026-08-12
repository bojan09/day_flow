const FIELD_MAP = {
  enabled: 'enabled',
  taskReminders: 'task_reminders',
  morningPlanning: 'morning_planning',
  upcomingTasks: 'upcoming_tasks',
  overdueSummary: 'overdue_summary',
  habitReminders: 'habit_reminders',
  routineReminders: 'routine_reminders',
  focusReminders: 'focus_reminders',
  eveningReview: 'evening_review',
  inactivityNudges: 'inactivity_nudges',
  morningTime: 'morning_time',
  eveningTime: 'evening_time',
  quietStart: 'quiet_start',
  quietEnd: 'quiet_end',
  timezone: 'timezone',
}

export function isValidNotificationTime(value) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)
}

export function isValidTimezone(value) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format()
    return true
  } catch {
    return false
  }
}

export function notificationPreferencesToDb(userId, preferences) {
  const row = { user_id: userId }
  for (const [clientKey, dbKey] of Object.entries(FIELD_MAP)) {
    if (preferences[clientKey] !== undefined) row[dbKey] = preferences[clientKey]
  }
  return row
}

export function notificationPreferencesFromDb(row) {
  const preferences = {}
  for (const [clientKey, dbKey] of Object.entries(FIELD_MAP)) {
    if (row?.[dbKey] !== undefined) preferences[clientKey] = row[dbKey]
  }
  return preferences
}
