// Hook: useGoals
// Purpose: Goal tracking with milestones, Supabase sync, and real-time
import { useState, useEffect, useCallback } from 'react'
import { storage } from '../services/storage'
import { goalsService } from '../services/supabaseDataService'
import { subscribeToTable } from '../services/realtimeService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'

const KEY = 'goals'
export const GOAL_TYPES      = ['Yearly', 'Quarterly', 'Monthly']
export const GOAL_CATEGORIES = ['Career', 'Health', 'Learning', 'Finance', 'Personal', 'Relationships']

export function useGoals() {
  const { user }  = useAuth()
  const userId    = user?.id
  const useDB     = isSupabaseConfigured() && !!userId

  const [goals, setGoals] = useState(() => storage.get(KEY, []))

  useEffect(() => {
    if (!useDB) return
    goalsService.getAll(userId).then(rows => { setGoals(rows); storage.set(KEY, rows) })
  }, [userId])

  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('goals', userId, () =>
      goalsService.getAll(userId).then(rows => { setGoals(rows); storage.set(KEY, rows) })
    )
  }, [userId])

  useEffect(() => { if (!useDB) storage.set(KEY, goals) }, [goals])

  const persist = useCallback(async (goal) => { if (useDB) await goalsService.upsert(userId, goal) }, [useDB, userId])

  const addGoal = (data) => {
    const g = {
      id: Date.now().toString(), title: data.title.trim(), description: data.description || '',
      type: data.type || 'Yearly', category: data.category || 'Personal', targetDate: data.targetDate || '',
      milestones: [], completed: false, createdAt: new Date().toISOString(),
      ...(useDB ? { user_id: userId } : {}),
    }
    setGoals(prev => [g, ...prev]); persist(g); return g
  }

  const updateGoal  = (id, updates) => setGoals(prev => prev.map(g => { if (g.id !== id) return g; const u = { ...g, ...updates }; persist(u); return u }))
  const deleteGoal  = (id)          => { setGoals(prev => prev.filter(g => g.id !== id)); if (useDB) goalsService.delete(userId, id) }
  const toggleGoal  = (id)          => updateGoal(id, { completed: !goals.find(g => g.id === id)?.completed })

  const addMilestone = (goalId, text) => updateGoal(goalId, {
    milestones: [...(goals.find(g => g.id === goalId)?.milestones || []), { id: Date.now().toString(), text, done: false }]
  })

  const toggleMilestone = (goalId, msId) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    updateGoal(goalId, { milestones: goal.milestones.map(m => m.id === msId ? { ...m, done: !m.done } : m) })
  }

  const getProgress = (goal) => {
    if (!goal.milestones.length) return goal.completed ? 100 : 0
    return Math.round((goal.milestones.filter(m => m.done).length / goal.milestones.length) * 100)
  }

  return { goals, addGoal, updateGoal, deleteGoal, toggleGoal, addMilestone, toggleMilestone, getProgress }
}
