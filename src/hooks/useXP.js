// Hook: useXP
// Purpose: XP + level system — earn points for tasks, streaks, mood, notes
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'

const KEY = 'xp_log'

export const XP_EVENTS = {
  TASK_DONE:      10,
  HABIT_DONE:     15,
  STREAK_7:       50,
  STREAK_14:     100,
  STREAK_30:     250,
  NOTE_WRITTEN:   5,
  MOOD_LOGGED:    8,
  FOCUS_SESSION:  20,
  GOAL_MILESTONE: 30,
  GOAL_COMPLETE: 100,
}

const LEVELS = [
  { level: 1,  min: 0,     title: 'Seedling 🌱'   },
  { level: 2,  min: 100,   title: 'Sprout 🌿'     },
  { level: 3,  min: 300,   title: 'Sapling 🌳'    },
  { level: 4,  min: 600,   title: 'Explorer 🧭'   },
  { level: 5,  min: 1000,  title: 'Builder 🔨'    },
  { level: 6,  min: 1500,  title: 'Achiever ⭐'   },
  { level: 7,  min: 2200,  title: 'Champion 🏆'   },
  { level: 8,  min: 3200,  title: 'Legend 🦁'     },
  { level: 9,  min: 4500,  title: 'Master 🎯'     },
  { level: 10, min: 6000,  title: 'Visionary 🚀'  },
]

export function useXP() {
  const [log, setLog] = useState(() => storage.get(KEY, []))
  useEffect(() => { storage.set(KEY, log) }, [log])

  const totalXP = log.reduce((sum, e) => sum + e.amount, 0)

  const getLevelInfo = () => {
    const current = [...LEVELS].reverse().find(l => totalXP >= l.min) || LEVELS[0]
    const nextIdx  = LEVELS.findIndex(l => l.level === current.level) + 1
    const next     = LEVELS[nextIdx]
    const progress = next
      ? Math.round(((totalXP - current.min) / (next.min - current.min)) * 100)
      : 100
    return { ...current, next, progress, totalXP }
  }

  const awardXP = (event, source = '') => {
    const amount = XP_EVENTS[event] || 0
    if (!amount) return
    setLog(prev => [...prev, { event, amount, source, date: new Date().toISOString() }])
  }

  return { totalXP, awardXP, getLevelInfo }
}
