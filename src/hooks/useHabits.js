// Hook: useHabits
// Purpose: Habit tracking with frequency, streaks, Supabase sync, and real-time
import { useState, useEffect, useCallback, useRef } from 'react'
import { storage } from '../services/storage'
import { habitsService } from '../services/supabaseDataService'
import { subscribeToTables } from '../services/realtimeService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'
import { getTodayKey, getDateKey } from '../utils/dateUtils'
import { startOfWeek, addDays } from 'date-fns'

export function useHabits() {
  const { user }  = useAuth()
  const userId    = user?.id
  const useDB            = isSupabaseConfigured() && !!userId
  const pendingDeletesRef = useRef(new Set())

  // Track in-flight local writes keyed by habit id (add/update habit), and
  // in-flight local log toggles keyed by `${habitId}_${date}` — a realtime-
  // triggered refetch (habits + habit_log share one subscription) can race
  // ahead of its own write's commit and would otherwise silently revert an
  // optimistic habit edit or a just-toggled day back to its old value.
  const pendingWritesRef = useRef(new Map())
  const pendingLogRef    = useRef(new Map())

  const [habits, setHabits] = useState(() => storage.get('habits', []))
  const [log,    setLog]    = useState(() => storage.get('habit_log', {}))
  const [synced, setSynced] = useState(false)

  const reconcile = (rawRows, dbLog) => {
    const filtered = rawRows.filter(h => !pendingDeletesRef.current.has(h.id))
    let habitsOut = filtered
    if (pendingWritesRef.current.size > 0) {
      const byId = new Map(filtered.map(h => [h.id, h]))
      for (const [id, localHabit] of pendingWritesRef.current) byId.set(id, localHabit)
      habitsOut = [...byId.values()]
    }
    let logOut = dbLog
    if (pendingLogRef.current.size > 0) {
      logOut = { ...dbLog }
      for (const [key, done] of pendingLogRef.current) logOut[key] = done
    }
    return { habits: habitsOut, log: logOut }
  }

  const loadFromDB = useCallback(() => {
    if (!useDB) return
    habitsService.getAll(userId).then(({ habits: rawRows, log: dbLog }) => {
      const { habits: rows, log: mergedLog } = reconcile(rawRows, dbLog)
      setHabits(rows); setLog(mergedLog)
      storage.set('habits', rows); storage.set('habit_log', mergedLog)
      setSynced(true)
    })
  }, [useDB, userId])

  useEffect(() => { if (useDB) loadFromDB(); else setSynced(true) }, [userId])

  useEffect(() => {
    if (!useDB) return
    return subscribeToTables(['habits', 'habit_log'], userId, loadFromDB)
  }, [userId])

  useEffect(() => { if (!useDB) { storage.set('habits', habits); storage.set('habit_log', log) } }, [habits, log])

  const persistHabit = async (h) => {
    if (!useDB) return
    pendingWritesRef.current.set(h.id, h)
    try {
      await habitsService.upsertHabit(userId, h)
      setTimeout(() => pendingWritesRef.current.delete(h.id), 3000)
    } catch (err) {
      pendingWritesRef.current.delete(h.id)
      throw err
    }
  }

  const addHabit = async (habit) => {
    const h = { id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, name: habit.name.trim(), icon: habit.icon || '⭐', frequency: habit.frequency || 'daily', createdAt: new Date().toISOString(), ...(useDB ? { user_id: userId } : {}) }
    setHabits(prev => [...prev, h])
    await persistHabit(h)
    return h
  }

  // Restore a previously deleted habit with its original id (undo) —
  // keeps streak history intact since the log is keyed by habit id.
  const restoreHabit = async (h) => {
    pendingDeletesRef.current.delete(h.id)
    setHabits(prev => [...prev, h])
    await persistHabit(h)
  }

  const updateHabit = async (id, updates) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h))
    await persistHabit({ ...habits.find(h => h.id === id), ...updates })
  }

  const deleteHabit = async (id) => {
    pendingDeletesRef.current.add(id)
    setHabits(prev => prev.filter(h => h.id !== id))
    if (useDB) {
      await habitsService.deleteHabit(userId, id)
      setTimeout(() => pendingDeletesRef.current.delete(id), 3000)
    }
  }

  const toggleHabitDay = async (habitId, date = getTodayKey()) => {
    const key  = `${habitId}_${date}`
    const done = !log[key]
    setLog(prev => ({ ...prev, [key]: done }))
    if (!useDB) return
    pendingLogRef.current.set(key, done)
    try {
      await habitsService.toggleLog(userId, habitId, date, done)
      setTimeout(() => pendingLogRef.current.delete(key), 3000)
    } catch (err) {
      pendingLogRef.current.delete(key)
      throw err
    }
  }

  const isHabitDone  = (habitId, date = getTodayKey()) => !!log[`${habitId}_${date}`]

  const getStreak = (habitId) => {
    let streak = 0
    const cursor = new Date()
    // If today isn't done yet, start counting from yesterday
    // so a streak of 6 days doesn't show as 0 just because today isn't ticked yet
    const todayKey = getDateKey(cursor)
    if (!log[`${habitId}_${todayKey}`]) {
      cursor.setDate(cursor.getDate() - 1)
    }
    while (true) {
      if (log[`${habitId}_${getDateKey(cursor)}`]) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      } else break
    }
    return streak
  }

  const getWeeklyCount = (habitId) => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter(d => log[`${habitId}_${getDateKey(d)}`]).length
  }

  const getMaxStreak       = () => habits.length === 0 ? 0 : Math.max(...habits.map(h => getStreak(h.id)))
  const getTodayCompletion = () => {
    if (habits.length === 0) return 0
    return Math.round((habits.filter(h => isHabitDone(h.id)).length / habits.length) * 100)
  }

  return { habits, log, synced, addHabit, restoreHabit, updateHabit, deleteHabit, toggleHabitDay, isHabitDone, getStreak, getWeeklyCount, getMaxStreak, getTodayCompletion }
}
