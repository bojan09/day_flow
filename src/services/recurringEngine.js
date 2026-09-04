// Service: recurringEngine
// Purpose: Checks recurring tasks and auto-creates today's instances if not yet generated
import { getTodayKey } from '../utils/dateUtils'


const DAY_MAP = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }

export function spawnRecurringTasks(allTasks, addTask) {
  const today       = getTodayKey()
  const todayDayNum = new Date().getDay()  // 0 = Sun, 1 = Mon …

  allTasks
    .filter(t =>
      t.isRecurring &&
      t.recurDays?.length > 0 &&
      (t.recurStatus ?? 'active') === 'active' &&
      (!t.recurEndDate || getTodayKey() <= t.recurEndDate)
    )
    .forEach(template => {
      const shouldRunToday = template.recurDays.some(d => DAY_MAP[d] === todayDayNum)
      if (!shouldRunToday) return

      // Check if an instance already exists for today
      const alreadyExists = allTasks.some(
        t => t.recurringFrom === template.id && t.date === today
      )
      if (alreadyExists) return

      addTask({
        title:        template.title,
        priority:     template.priority,
        category:     template.category,
        date:         today,
        estimateMins: template.estimateMins,
        isRecurring:  false,          // instances are not themselves recurring
        recurringFrom: template.id,   // tracks origin
        reminderTime: template.reminderTime || '',
      })
    })
}
