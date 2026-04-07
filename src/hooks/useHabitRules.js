// Hook: useHabitRules
// Purpose: "If habit A done → auto-complete habit B" rule engine
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { getTodayKey } from '../utils/dateUtils'

const KEY = 'habit_rules'

export function useHabitRules() {
  const [rules, setRules] = useState(() => storage.get(KEY, []))
  useEffect(() => { storage.set(KEY, rules) }, [rules])

  const addRule = (triggerId, actionId) => {
    // Avoid duplicates
    if (rules.some(r => r.triggerId === triggerId && r.actionId === actionId)) return
    setRules(prev => [...prev, {
      id:        Date.now().toString(),
      triggerId,
      actionId,
      createdAt: new Date().toISOString(),
    }])
  }

  const deleteRule   = (id) => setRules(prev => prev.filter(r => r.id !== id))

  // Called after a habit is toggled — fires chained completions
  const fireRules = (triggeredHabitId, toggleHabitDay) => {
    const today = getTodayKey()
    rules
      .filter(r => r.triggerId === triggeredHabitId)
      .forEach(r => {
        // Only auto-complete, never undo
        toggleHabitDay(r.actionId, today)
      })
  }

  const getRulesForHabit = (habitId) => rules.filter(r => r.triggerId === habitId)

  return { rules, addRule, deleteRule, fireRules, getRulesForHabit }
}
