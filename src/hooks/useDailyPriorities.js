import { useMemo } from 'react'
import { usePersistedState } from './usePersistedState'
import { normalizeDailyPriorities } from '../services/dailyPriorities'
import { getTodayKey } from '../utils/dateUtils'

export function useDailyPriorities(allTasks) {
  const [byDate, setByDate] = usePersistedState('daily_priorities', {})
  const today = getTodayKey()
  const ids = useMemo(
    () => normalizeDailyPriorities(byDate?.[today], allTasks),
    [allTasks, byDate, today],
  )
  const tasks = ids.map(id => allTasks.find(task => String(task.id) === id)).filter(Boolean)
  const save = next => setByDate(previous => ({ ...previous, [today]: normalizeDailyPriorities(next, allTasks) }))

  return {
    ids,
    tasks,
    add: id => { if (ids.length < 3) save([...ids, String(id)]) },
    remove: id => save(ids.filter(item => item !== String(id))),
    reorder: nextIds => save(nextIds),
    clearCompleted: () => save(ids),
  }
}
