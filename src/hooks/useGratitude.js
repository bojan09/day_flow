// Hook: useGratitude
// Purpose: Daily 3-line gratitude log with browsable history
import { useEffect } from 'react'
import { usePersistedState } from './usePersistedState'
import { getTodayKey } from '../utils/dateUtils'

const KEY = 'gratitude'

export function useGratitude() {
  const [entries, setEntries] = usePersistedState(KEY, {})

  const today = getTodayKey()

  const getTodayEntry  = ()          => entries[today] || ['', '', '']
  const getEntryForDate = (dateKey)  => entries[dateKey] || null

  const setTodayEntry  = (lines)     =>
    setEntries(prev => ({ ...prev, [today]: lines }))

  const getHistory = (limit = 30) =>
    Object.entries(entries)
      .filter(([, lines]) => lines.some(l => l.trim()))
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, limit)

  return { getTodayEntry, setTodayEntry, getEntryForDate, getHistory }
}
