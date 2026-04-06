// Hook: useGoals
// Purpose: Goal tracking — quarterly/yearly goals with milestones and progress
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'

const KEY = 'goals'

export const GOAL_TYPES    = ['Yearly', 'Quarterly', 'Monthly']
export const GOAL_CATEGORIES = ['Career', 'Health', 'Learning', 'Finance', 'Personal', 'Relationships']

export function useGoals() {
  const [goals, setGoals] = useState(() => storage.get(KEY, []))
  useEffect(() => { storage.set(KEY, goals) }, [goals])

  const addGoal = (data) => {
    const goal = {
      id:          Date.now().toString(),
      title:       data.title.trim(),
      description: data.description || '',
      type:        data.type        || 'Yearly',
      category:    data.category    || 'Personal',
      targetDate:  data.targetDate  || '',
      milestones:  [],
      completed:   false,
      createdAt:   new Date().toISOString(),
    }
    setGoals(prev => [goal, ...prev])
    return goal
  }

  const updateGoal   = (id, updates) =>
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))

  const deleteGoal   = (id) => setGoals(prev => prev.filter(g => g.id !== id))
  const toggleGoal   = (id) =>
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g))

  const addMilestone = (goalId, text) =>
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, milestones: [...g.milestones, { id: Date.now().toString(), text, done: false }] }
        : g
    ))

  const toggleMilestone = (goalId, milestoneId) =>
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, done: !m.done } : m) }
        : g
    ))

  const getProgress = (goal) => {
    if (!goal.milestones.length) return goal.completed ? 100 : 0
    return Math.round((goal.milestones.filter(m => m.done).length / goal.milestones.length) * 100)
  }

  return { goals, addGoal, updateGoal, deleteGoal, toggleGoal, addMilestone, toggleMilestone, getProgress }
}
