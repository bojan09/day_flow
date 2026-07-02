// Service: repeating/workoutAdapter
// Purpose: Normalize recurring workout sessions into the shared RepeatingItem shape.
import { format, addDays } from 'date-fns'

const FREQ_LABEL = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }

function nextOccurrence(session) {
  const r = session.recurrence
  const base = new Date(session.date)
  for (let i = 0; i < 32; i++) {
    const d = addDays(new Date(), i)
    if (r === 'daily') return format(d, 'yyyy-MM-dd')
    if (r === 'weekly' && d.getDay() === base.getDay()) return format(d, 'yyyy-MM-dd')
    if (r === 'monthly' && d.getDate() === base.getDate()) return format(d, 'yyyy-MM-dd')
  }
  return null
}

export function workoutsToRepeating(sessions = []) {
  return sessions
    .filter(s => s.recurrence && s.recurrence !== 'none')
    .map(s => {
      const status = (s.recurStatus ?? 'active')
      return {
        id: s.id,
        sourceId: s.id,
        type: 'workout',
        name: s.title || 'Workout',
        frequency: FREQ_LABEL[s.recurrence] || 'Custom',
        scheduleLabel: FREQ_LABEL[s.recurrence] || s.recurrence,
        nextOccurrence: status === 'active' ? nextOccurrence(s) : null,
        status,
        endDate: null,
        _raw: s,
      }
    })
}
