// Service: recurringWorkoutsEngine
// Purpose: Auto-creates today's workout instance for sessions marked as recurring.
//          Duplicate check: by BOTH recurringFrom ID AND title+date fallback
//          so old sessions without recurringFrom are still caught.
import { getTodayKey } from '../utils/dateUtils'
import { format }       from 'date-fns'

export function spawnRecurringWorkouts(allSessions, addSession) {
  const today       = getTodayKey()
  const todayDate   = new Date()
  const todayDOW    = todayDate.getDay()
  const todayDOM    = todayDate.getDate()

  allSessions
    .filter(s => s.recurrence && s.recurrence !== 'none')
    .forEach(template => {
      let shouldFire = false
      if (template.recurrence === 'daily') {
        shouldFire = true
      } else if (template.recurrence === 'weekly') {
        shouldFire = new Date(template.date).getDay() === todayDOW
      } else if (template.recurrence === 'monthly') {
        shouldFire = new Date(template.date).getDate() === todayDOM
      }

      if (!shouldFire) return

      // Don't spawn a session for the template's own original date
      if (template.date === today) return

      // Primary check: by recurringFrom + date (for sessions created after the fix)
      const byId = allSessions.some(
        s => s.recurringFrom === template.id && s.date === today
      )

      // Fallback check: by title + date (catches old sessions without recurringFrom)
      const byTitle = allSessions.some(
        s => s.title === template.title &&
             s.date  === today &&
             s.id    !== template.id
      )

      if (byId || byTitle) return

      addSession({
        title:        template.title,
        type:         template.type,
        muscleGroups: template.muscleGroups,
        date:         today,
        durationMins: template.durationMins,
        notes:        '',
        exercises:    template.exercises?.map(e => ({
          ...e,
          sets: e.sets?.map(s => ({ ...s, done: false })) ?? [],
        })) ?? [],
        recurrence:    'none',
        recurringFrom: template.id,
      })
    })
}
