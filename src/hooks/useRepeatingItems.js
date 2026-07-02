// Hook: useRepeatingItems
// Purpose: Aggregate every recurring item across sources into one normalized list.
//          Scalable: register a new adapter to surface a new recurring type.
import { useMemo } from 'react'
import { tasksToRepeating }    from '../services/repeating/taskAdapter'
import { workoutsToRepeating } from '../services/repeating/workoutAdapter'

export function useRepeatingItems(tasks, workouts) {
  return useMemo(() => {
    const items = [
      ...tasksToRepeating(tasks.tasks || []),
      ...workoutsToRepeating(workouts.sessions || []),
    ]
    // Active first, then by soonest next occurrence
    return items.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1
      if (!a.nextOccurrence) return 1
      if (!b.nextOccurrence) return -1
      return a.nextOccurrence.localeCompare(b.nextOccurrence)
    })
  }, [tasks.tasks, workouts.sessions])
}
