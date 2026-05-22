// Hook: useTimeblocks
// Purpose: Shared access to today's custom timeblock entries.
//          Both TimeBlockView and CalendarWidget read the same persisted data.
import { usePersistedState } from './usePersistedState'
import { getTodayKey }       from '../utils/dateUtils'

export function useTimeblocks() {
  const today = getTodayKey()
  const [custom, setCustom] = usePersistedState(`custom_entries_${today}`, {})

  // Returns array of { hour, text } sorted by hour
  const getEntriesForDate = (dateKey) => {
    if (dateKey !== today) return []
    return Object.entries(custom)
      .map(([hour, text]) => ({ hour: parseInt(hour, 10), text }))
      .filter(e => e.text?.trim())
      .sort((a, b) => a.hour - b.hour)
  }

  return { custom, setCustom, getEntriesForDate }
}
