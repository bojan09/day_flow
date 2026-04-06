// Hook: useGratitude
// Purpose: Daily 3-line gratitude log with browsable history
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { getTodayKey } from '../utils/dateUtils'

const KEY = 'gratitude'

export function useGratitude() {
  const [entries, setEntries] = useState(() => storage.get(KEY, {}))
  useEffect(() => { storage.set(KEY, entries) }, [entries])

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
