// Hook: useHabits
// Purpose: Habit tracking with frequency (daily vs X/week), streaks, localStorage
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { getTodayKey, getDateKey } from '../utils/dateUtils'
import { startOfWeek, addDays } from 'date-fns'

const HABITS_KEY = 'habits'
const LOG_KEY    = 'habit_log'

export function useHabits() {
  const [habits, setHabits] = useState(() => storage.get(HABITS_KEY, []))
  const [log,    setLog]    = useState(() => storage.get(LOG_KEY, {}))

  useEffect(() => { storage.set(HABITS_KEY, habits) }, [habits])
  useEffect(() => { storage.set(LOG_KEY, log) },    [log])

  const addHabit = (habit) => {
    const newHabit = {
      id:          Date.now().toString(),
      name:        habit.name.trim(),
      icon:        habit.icon        || '⭐',
      frequency:   habit.frequency   || 'daily',   // 'daily' | number (times/week)
      createdAt:   new Date().toISOString(),
    }
    setHabits(prev => [...prev, newHabit])
    return newHabit
  }

  const deleteHabit     = (id) => setHabits(prev => prev.filter(h => h.id !== id))

  const toggleHabitDay  = (habitId, date = getTodayKey()) => {
    const key = `${habitId}_${date}`
    setLog(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isHabitDone     = (habitId, date = getTodayKey()) => !!log[`${habitId}_${date}`]

  const getStreak = (habitId) => {
    let streak = 0
    const cursor = new Date()
    while (true) {
      if (log[`${habitId}_${getDateKey(cursor)}`]) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      } else break
    }
    return streak
  }

  // Count completions in current week for a habit
  const getWeeklyCount = (habitId) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
      .filter(d => log[`${habitId}_${getDateKey(d)}`]).length
  }

  const getMaxStreak = () =>
    habits.length === 0 ? 0 : Math.max(...habits.map(h => getStreak(h.id)))

  const getTodayCompletion = () => {
    if (habits.length === 0) return 0
    const done = habits.filter(h => isHabitDone(h.id)).length
    return Math.round((done / habits.length) * 100)
  }

  return {
    habits, log, addHabit, deleteHabit,
    toggleHabitDay, isHabitDone,
    getStreak, getWeeklyCount, getMaxStreak, getTodayCompletion,
  }
}
