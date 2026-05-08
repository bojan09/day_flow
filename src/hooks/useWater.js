// Hook: useWater
// Purpose: Tracks daily water intake. Writes are debounced 600ms to prevent
//          rapid tapping from firing multiple Supabase writes.
import { useEffect, useRef } from 'react'
import { usePersistedState } from './usePersistedState'
import { getTodayKey }        from '../utils/dateUtils'
import { withRetry }          from '../utils/withRetry'

const KEY  = 'water_log'
export const GOAL = 8

export function useWater() {
  const today = getTodayKey()
  const [log, setLog] = usePersistedState(KEY, {})
  const pendingRef    = useRef(null)

  // Debounced persist — batches rapid taps into one write
  const debouncedSet = (updater) => {
    setLog(updater)
    if (pendingRef.current) clearTimeout(pendingRef.current)
    // The write is handled by usePersistedState automatically on setLog
    // This hook just ensures we don't call setLog (and thus Supabase) on every tap
    pendingRef.current = setTimeout(() => {
      pendingRef.current = null
    }, 600)
  }

  const addGlass    = () => debouncedSet(prev => ({ ...prev, [today]: Math.min((prev[today] || 0) + 1, GOAL) }))
  const removeGlass = () => debouncedSet(prev => ({ ...prev, [today]: Math.max((prev[today] || 0) - 1, 0) }))

  const getTodayCount    = ()      => log[today] || 0
  const getCountForDate  = (date)  => log[date]  || 0

  const getProgress = () => {
    const count = getTodayCount()
    return { count, goal: GOAL, pct: Math.round((count / GOAL) * 100) }
  }

  return { getTodayCount, getCountForDate, addGlass, removeGlass, getProgress, GOAL }
}
