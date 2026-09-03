// Hook: useGoals
// Purpose: Goal tracking with milestones.
//          Sync/realtime/guards live in useSyncedCollection.
import { goalsService } from '../services/supabaseDataService'
import { useSyncedCollection } from './useSyncedCollection'

export const GOAL_TYPES      = ['Yearly', 'Quarterly', 'Monthly']
export const GOAL_CATEGORIES = ['Career', 'Health', 'Learning', 'Finance', 'Personal', 'Relationships']

export function useGoals() {
  const {
    items: goals, setItems: setGoals, synced, useDB, userId, persist, remove, unmarkDeleted,
  } = useSyncedCollection({ storageKey: 'goals', table: 'goals', service: goalsService })

  const addGoal = (data) => {
    const g = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, title: data.title.trim(), description: data.description || '',
      type: data.type || 'Yearly', category: data.category || 'Personal', targetDate: data.targetDate || '',
      milestones: Array.isArray(data.milestones) ? data.milestones : [], completed: false, createdAt: new Date().toISOString(),
      ...(useDB ? { user_id: userId } : {}),
    }
    setGoals(prev => [g, ...prev]); persist(g); return g
  }

  const updateGoal  = (id, updates) => setGoals(prev => prev.map(g => { if (g.id !== id) return g; const u = { ...g, ...updates }; persist(u); return u }))
  // Restore a previously deleted goal with its original id/milestones (undo)
  const restoreGoal = (g) => { unmarkDeleted(g.id); setGoals(prev => [g, ...prev]); persist(g) }

  const deleteGoal  = (id)          => { setGoals(prev => prev.filter(g => g.id !== id)); remove(id) }
  const toggleGoal  = (id)          => updateGoal(id, { completed: !goals.find(g => g.id === id)?.completed })

  const addMilestone = (goalId, text) => updateGoal(goalId, {
    milestones: [...(goals.find(g => g.id === goalId)?.milestones || []), { id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, text, done: false }]
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

  return { goals, synced, addGoal, restoreGoal, updateGoal, deleteGoal, toggleGoal, addMilestone, toggleMilestone, getProgress }
}
