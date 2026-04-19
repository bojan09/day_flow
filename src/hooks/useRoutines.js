// Hook: useRoutines
// Purpose: Full CRUD for routine checklists — create, edit, delete routines and their steps.
//          Steps auto-reset each day. Timer state is local to the component.
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { getTodayKey } from '../utils/dateUtils'

const KEY     = 'routines'
const LOG_KEY = 'routine_log'

export const ROUTINE_TIMES  = ['morning', 'midday', 'evening', 'anytime']
export const ROUTINE_EMOJIS = ['🌅','🌙','💪','📖','🧘','☕','🚶','✍️','🎯','🔥','⚡','🌿']

const DEFAULT_ROUTINES = [
  {
    id:    'morning',
    name:  'Morning Routine',
    emoji: '🌅',
    time:  'morning',
    steps: [
      { id: 's1', text: 'Wake up & no phone for 10 min', duration: 10 },
      { id: 's2', text: 'Drink a full glass of water',   duration: 2  },
      { id: 's3', text: 'Stretch or light movement',     duration: 5  },
      { id: 's4', text: "Review today's tasks & goals",  duration: 5  },
    ],
  },
  {
    id:    'evening',
    name:  'Evening Routine',
    emoji: '🌙',
    time:  'evening',
    steps: [
      { id: 'e1', text: 'Review what you accomplished', duration: 5  },
      { id: 'e2', text: "Set tomorrow's top 3 tasks",   duration: 5  },
      { id: 'e3', text: 'Journal or gratitude',         duration: 10 },
      { id: 'e4', text: 'No screens 30 min before bed', duration: 30 },
    ],
  },
]

export function useRoutines() {
  const [routines, setRoutines] = useState(() => storage.get(KEY, DEFAULT_ROUTINES))
  const [log,      setLog]      = useState(() => storage.get(LOG_KEY, {}))

  useEffect(() => { storage.set(KEY,     routines) }, [routines])
  useEffect(() => { storage.set(LOG_KEY, log)      }, [log])

  const today = getTodayKey()

  // ── Routine CRUD ────────────────────────────────────────────────────────────

  const addRoutine = (data) => {
    const routine = {
      id:    Date.now().toString(),
      name:  data.name?.trim() || 'New Routine',
      emoji: data.emoji        || '🎯',
      time:  data.time         || 'morning',
      steps: data.steps        || [],
    }
    setRoutines(prev => [...prev, routine])
    return routine
  }

  const updateRoutine = (id, updates) =>
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))

  const deleteRoutine = (id) =>
    setRoutines(prev => prev.filter(r => r.id !== id))

  // ── Step CRUD ───────────────────────────────────────────────────────────────

  const addStep = (routineId, text, duration = 5) =>
    setRoutines(prev => prev.map(r =>
      r.id !== routineId ? r : {
        ...r,
        steps: [...r.steps, { id: Date.now().toString(), text: text.trim(), duration }],
      }
    ))

  const updateStep = (routineId, stepId, updates) =>
    setRoutines(prev => prev.map(r =>
      r.id !== routineId ? r : {
        ...r,
        steps: r.steps.map(s => s.id === stepId ? { ...s, ...updates } : s),
      }
    ))

  const removeStep = (routineId, stepId) =>
    setRoutines(prev => prev.map(r =>
      r.id !== routineId ? r : {
        ...r,
        steps: r.steps.filter(s => s.id !== stepId),
      }
    ))

  const reorderSteps = (routineId, fromIdx, toIdx) =>
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r
      const steps  = [...r.steps]
      const [item] = steps.splice(fromIdx, 1)
      steps.splice(toIdx, 0, item)
      return { ...r, steps }
    }))

  // ── Daily log ───────────────────────────────────────────────────────────────

  const toggleStep = (routineId, stepId) => {
    const key     = `${routineId}_${today}`
    const current = log[key] || {}
    setLog(prev => ({ ...prev, [key]: { ...current, [stepId]: !current[stepId] } }))
  }

  const isStepDone = (routineId, stepId) =>
    !!(log[`${routineId}_${today}`] || {})[stepId]

  const resetRoutine = (routineId) => {
    const key = `${routineId}_${today}`
    setLog(prev => ({ ...prev, [key]: {} }))
  }

  const getCompletion = (routineId) => {
    const r = routines.find(r => r.id === routineId)
    if (!r || r.steps.length === 0) return 0
    const done = r.steps.filter(s => isStepDone(routineId, s.id)).length
    return Math.round((done / r.steps.length) * 100)
  }

  const getTotalDuration = (routineId) => {
    const r = routines.find(r => r.id === routineId)
    return r ? r.steps.reduce((sum, s) => sum + (s.duration || 0), 0) : 0
  }

  return {
    routines,
    // Routine CRUD
    addRoutine, updateRoutine, deleteRoutine,
    // Step CRUD
    addStep, updateStep, removeStep, reorderSteps,
    // Daily log
    toggleStep, isStepDone, resetRoutine, getCompletion, getTotalDuration,
  }
}
