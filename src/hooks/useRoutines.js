// Hook: useRoutines
// Purpose: Daily routine checklists (morning/evening) that auto-reset each day
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { getTodayKey } from '../utils/dateUtils'

const KEY      = 'routines'
const LOG_KEY  = 'routine_log'

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
      { id: 's4', text: 'Review today\'s tasks & goals', duration: 5  },
    ],
  },
  {
    id:    'evening',
    name:  'Evening Routine',
    emoji: '🌙',
    time:  'evening',
    steps: [
      { id: 'e1', text: 'Review what you accomplished',  duration: 5  },
      { id: 'e2', text: 'Set tomorrow\'s top 3 tasks',   duration: 5  },
      { id: 'e3', text: 'Journal or gratitude',          duration: 10 },
      { id: 'e4', text: 'No screens 30 min before bed',  duration: 30 },
    ],
  },
]

export function useRoutines() {
  const [routines, setRoutines] = useState(() => storage.get(KEY, DEFAULT_ROUTINES))
  const [log,      setLog]      = useState(() => storage.get(LOG_KEY, {}))

  useEffect(() => { storage.set(KEY,     routines) }, [routines])
  useEffect(() => { storage.set(LOG_KEY, log)      }, [log])

  const today = getTodayKey()

  const getLog = (routineId) => log[`${routineId}_${today}`] || {}

  const toggleStep = (routineId, stepId) => {
    const key     = `${routineId}_${today}`
    const current = log[key] || {}
    setLog(prev => ({ ...prev, [key]: { ...current, [stepId]: !current[stepId] } }))
  }

  const isStepDone = (routineId, stepId) => !!(log[`${routineId}_${today}`] || {})[stepId]

  const getCompletion = (routineId) => {
    const r    = routines.find(r => r.id === routineId)
    if (!r) return 0
    const done = r.steps.filter(s => isStepDone(routineId, s.id)).length
    return Math.round((done / r.steps.length) * 100)
  }

  const addStep = (routineId, text, duration = 5) =>
    setRoutines(prev => prev.map(r =>
      r.id === routineId
        ? { ...r, steps: [...r.steps, { id: Date.now().toString(), text, duration }] }
        : r
    ))

  const removeStep = (routineId, stepId) =>
    setRoutines(prev => prev.map(r =>
      r.id === routineId ? { ...r, steps: r.steps.filter(s => s.id !== stepId) } : r
    ))

  return { routines, toggleStep, isStepDone, getCompletion, addStep, removeStep }
}
