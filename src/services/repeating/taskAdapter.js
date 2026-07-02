// Service: repeating/taskAdapter
// Purpose: Normalize recurring task templates into the shared RepeatingItem shape.
import { format, addDays } from 'date-fns'

const DAY_NUM = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

// Frequency label from recurDays: 7 = Daily, weekdays/weekends handled loosely, else Custom
function frequencyOf(days = []) {
  if (days.length >= 7) return 'Daily'
  if (days.length === 1) return 'Weekly'
  return 'Custom'
}

// Next date (YYYY-MM-DD) matching one of recurDays, from today forward
function nextOccurrence(days = [], endDate) {
  if (!days.length) return null
  const targets = days.map(d => DAY_NUM[d]).filter(n => n !== undefined)
  for (let i = 0; i < 14; i++) {
    const d = addDays(new Date(), i)
    if (targets.includes(d.getDay())) {
      const key = format(d, 'yyyy-MM-dd')
      if (endDate && key > endDate) return null
      return key
    }
  }
  return null
}

export function tasksToRepeating(tasks = []) {
  return tasks
    .filter(t => t.isRecurring && (t.recurDays?.length > 0))
    .map(t => {
      const status = (t.recurStatus ?? 'active')
      return {
        id: t.id,
        sourceId: t.id,
        type: 'task',
        name: t.title || 'Untitled task',
        frequency: frequencyOf(t.recurDays),
        scheduleLabel: t.recurDays.length >= 7 ? 'Every day' : t.recurDays.join(' '),
        nextOccurrence: status === 'active' ? nextOccurrence(t.recurDays, t.recurEndDate) : null,
        status,
        endDate: t.recurEndDate || null,
        _raw: t,
      }
    })
}
