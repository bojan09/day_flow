// Purpose: Combine a task's date (YYYY-MM-DD) and reminderTime (HH:MM, local
//          time) into an absolute timestamp for the reminder-cron to compare
//          against `now()`. Returns null when either input is missing —
//          a task with no reminder set has no reminderAt.
export function computeReminderAt(date, reminderTime) {
  if (!date || !reminderTime) return null
  const [hours, minutes] = reminderTime.split(':').map(Number)
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(year, month - 1, day, hours, minutes, 0, 0)
  return d.toISOString()
}
