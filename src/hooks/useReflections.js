// Hook: useReflections
// Purpose: Storage for the Daily Reflection feature.
//
// Deliberately built on the existing KV layer (usePersistedState -> user_data)
// rather than a new table. The spec says to inspect the current architecture
// before adding tables, and every comparable per-day feature in this app —
// mood, intention, energy — already lives in KV. The `moods` table in
// schema.sql is in fact unused; useMood stores moods in KV. Following the
// pattern that is actually in use means no migration to run, offline-queue
// support and the localStorage fallback all come for free.
//
// The one weakness of KV is that a row is read whole on load, so entries are
// sharded one blob per month. A month caps a blob at ~30 entries instead of
// letting it grow for the life of the account.
import { useMemo } from 'react'
import { usePersistedState } from './usePersistedState'
import { getTodayKey } from '../utils/dateUtils'
import {
  emptyReflection, mergeReflection, isMorningDone, isEveningDone,
  shardKeyFor, previousDateKey, reflectionStreak,
} from '../services/reflectionModel'

export function useReflections(dateKey = getTodayKey()) {
  const monthKey = shardKeyFor(dateKey)
  const [month, setMonth] = usePersistedState(monthKey, {})

  // Yesterday can fall in the previous month, which is a different KV row.
  const prevKey       = previousDateKey(dateKey)
  const prevMonthKey  = shardKeyFor(prevKey)
  const sameMonth     = prevMonthKey === monthKey
  const [prevMonth]   = usePersistedState(prevMonthKey, {})

  const entry     = month?.[dateKey] ?? emptyReflection(dateKey)
  const yesterday = (sameMonth ? month : prevMonth)?.[prevKey] ?? null

  const save = (patch) => {
    setMonth(prev => ({
      ...prev,
      [dateKey]: mergeReflection(prev?.[dateKey], patch, dateKey),
    }))
  }

  const completeMorning = (patch = {}) => save({ ...patch, morningDoneAt: new Date().toISOString() })
  const completeEvening = (patch = {}) => save({ ...patch, eveningDoneAt: new Date().toISOString() })

  // What the next morning opens with — the spec's "carry forward".
  const carryForward = yesterday?.carryForward || ''

  const streak = useMemo(
    () => reflectionStreak({ ...(sameMonth ? {} : prevMonth), ...month }, dateKey),
    [month, prevMonth, sameMonth, dateKey],
  )

  return {
    entry,
    yesterday,
    carryForward,
    streak,
    morningDone: isMorningDone(entry),
    eveningDone: isEveningDone(entry),
    save,
    completeMorning,
    completeEvening,
    // History within the loaded month, newest first — enough for the weekly
    // review; older months load on demand by passing a date in that month.
    month,
    entries: Object.values(month || {}).sort((a, b) => (b.dateKey || '').localeCompare(a.dateKey || '')),
  }
}
