// Service: recurringWorkoutsEngine
// Purpose: Auto-creates today's workout instance for sessions marked as recurring.
//          Daily → every day. Weekly → same weekday. Monthly → same date.
//          Guards against duplicates with recurringFrom tracking.
import { getTodayKey } from '../utils/dateUtils'
import { format }       from 'date-fns'

export function spawnRecurringWorkouts(allSessions, addSession) {
  const today       = getTodayKey()
  const todayDate   = new Date()
  const todayDOW    = todayDate.getDay()      // 0 Sun – 6 Sat
  const todayDOM    = todayDate.getDate()      // 1–31

  allSessions
    .filter(s => s.recurrence && s.recurrence !== 'none')
    .forEach(template => {
      // Determine if this template should fire today
      let shouldFire = false
      if (template.recurrence === 'daily') {
        shouldFire = true
      } else if (template.recurrence === 'weekly') {
        // Same day of week as the original session
        const templateDOW = new Date(template.date).getDay()
        shouldFire = templateDOW === todayDOW
      } else if (template.recurrence === 'monthly') {
        // Same calendar day as the original session
        const templateDOM = new Date(template.date).getDate()
        shouldFire = templateDOM === todayDOM
      }

      if (!shouldFire) return

      // Check if an instance already exists for today from this template
      const alreadyExists = allSessions.some(
        s => s.recurringFrom === template.id && s.date === today
      )
      // Also prevent spawning the template itself as a duplicate
      if (alreadyExists || template.date === today) return

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
        recurrence:    'none',           // instance is not itself recurring
        recurringFrom: template.id,      // tracks origin template
      })
    })
}
