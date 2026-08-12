// Hook: useHabits
// Purpose: Habit tracking with frequency, streaks, Supabase sync, and real-time
import { useState, useEffect, useCallback, useRef } from 'react'
import { scopedStorage } from '../services/storage'
import { storageScope } from '../services/scopedStorage'
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
  const scope            = storageScope(userId, isSupabaseConfigured())
  const pendingDeletesRef = useRef(new Set())

  const [habits, setHabits] = useState(() => scopedStorage.get(scope, 'habits', []))
  const [log,    setLog]    = useState(() => scopedStorage.get(scope, 'habit_log', {}))
  const [synced, setSynced] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const loadedScopeRef = useRef(scope)

  const loadFromDB = useCallback(() => {
    if (!useDB) return
    habitsService.getAll(userId).then(result => {
      if (!result.ok) { setSyncError(result.error); setSynced(true); return }
      const { habits: rawRows, log: dbLog } = result.value
      const rows = rawRows.filter(h => !pendingDeletesRef.current.has(h.id))
      setHabits(rows); setLog(dbLog)
      scopedStorage.set(scope, 'habits', rows); scopedStorage.set(scope, 'habit_log', dbLog)
      setSynced(true)
    })
  }, [scope, useDB, userId])

  useEffect(() => {
    setSynced(false); setSyncError(null)
    const habitsFallback = scope === 'demo' ? scopedStorage.readLegacy('habits', []) : []
    const logFallback = scope === 'demo' ? scopedStorage.readLegacy('habit_log', {}) : {}
    setHabits(scopedStorage.get(scope, 'habits', habitsFallback))
    setLog(scopedStorage.get(scope, 'habit_log', logFallback))
    if (useDB) loadFromDB(); else setSynced(true)
  }, [loadFromDB, scope, useDB])

  useEffect(() => {
    if (!useDB) return
    return subscribeToTables(['habits', 'habit_log'], userId, loadFromDB)
  }, [loadFromDB, useDB, userId])

  useEffect(() => {
    if (loadedScopeRef.current !== scope) { loadedScopeRef.current = scope; return }
    scopedStorage.set(scope, 'habits', habits)
    scopedStorage.set(scope, 'habit_log', log)
  }, [habits, log, scope])

  const addHabit = async (habit) => {
    const h = { id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, name: habit.name.trim(), icon: habit.icon || '⭐', frequency: habit.frequency || 'daily', createdAt: new Date().toISOString(), ...(useDB ? { user_id: userId } : {}) }
    setHabits(prev => [...prev, h])
    if (useDB) await habitsService.upsertHabit(userId, h)
    return h
  }

  // Restore a previously deleted habit with its original id (undo) —
  // keeps streak history intact since the log is keyed by habit id.
  const restoreHabit = async (h) => {
    pendingDeletesRef.current.delete(h.id)
    setHabits(prev => [...prev, h])
    if (useDB) await habitsService.upsertHabit(userId, h)
  }

  const updateHabit = async (id, updates) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h))
    if (useDB) await habitsService.upsertHabit(userId, { ...habits.find(h => h.id === id), ...updates })
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
    if (useDB) await habitsService.toggleLog(userId, habitId, date, done)
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

  return { habits, log, synced, syncError, addHabit, restoreHabit, updateHabit, deleteHabit, toggleHabitDay, isHabitDone, getStreak, getWeeklyCount, getMaxStreak, getTodayCompletion }
}
