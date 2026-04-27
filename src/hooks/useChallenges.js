// Hook: useChallenges
// Purpose: CRUD for 30/21/14/7-day challenges with recurring support.
//          Progress is tracked daily and auto-resets when recurring challenge completes.
import { usePersistedState } from './usePersistedState'
import { getTodayKey }       from '../utils/dateUtils'
import { format, addDays }   from 'date-fns'

const KEY     = 'challenges'
const LOG_KEY = 'challenge_log'

export const CHALLENGE_PRESETS = [
  { title: 'No social media',  emoji: '📵', days: 7  },
  { title: 'Walk every day',   emoji: '🚶', days: 30 },
  { title: 'Read 10 pages',    emoji: '📖', days: 30 },
  { title: 'Cold shower',      emoji: '🚿', days: 7  },
  { title: 'No junk food',     emoji: '🥗', days: 14 },
  { title: 'Sleep by 10pm',    emoji: '😴', days: 7  },
  { title: 'Drink 8 glasses',  emoji: '💧', days: 14 },
  { title: 'Meditate 10 min',  emoji: '🧘', days: 21 },
]

export const RECURRENCE_OPTIONS = [
  { id: 'none',    label: 'One-time'  },
  { id: 'daily',   label: 'Daily'     },
  { id: 'weekly',  label: 'Weekly'    },
  { id: 'monthly', label: 'Monthly'   },
]

export function useChallenges() {
  const [challenges, setChallenges] = usePersistedState(KEY, [])
  const [log,        setLog]        = usePersistedState(LOG_KEY, {})

  const today = getTodayKey()

  // ── Challenge CRUD ─────────────────────────────────────────────────────────
  const startChallenge = (data) => {
    const c = {
      id:          Date.now().toString(),
      title:       data.title?.trim()  || 'New Challenge',
      emoji:       data.emoji          || '🎯',
      description: data.description   || '',
      days:        Number(data.days)   || 7,
      recurrence:  data.recurrence     || 'none',
      startDate:   today,
      active:      true,
      completedAt: null,
    }
    setChallenges(prev => [c, ...prev])
    return c
  }

  const updateChallenge = (id, updates) =>
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))

  const deleteChallenge = (id) => {
    setChallenges(prev => prev.filter(c => c.id !== id))
    setLog(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(k => { if (k.startsWith(`${id}_`)) delete next[k] })
      return next
    })
  }

  // ── Daily log ──────────────────────────────────────────────────────────────
  const toggleDay = (challengeId, dateKey = today) => {
    const key = `${challengeId}_${dateKey}`
    setLog(prev => ({ ...prev, [key]: !prev[key] }))

    // Check if challenge is now complete and handle recurrence
    const c = challenges.find(c => c.id === challengeId)
    if (!c) return
    const completed = getCompletedDays(challengeId) + 1
    if (completed >= c.days && c.recurrence !== 'none') {
      // Auto-restart with new startDate
      const nextStart = addDays(new Date(), 1)
      updateChallenge(challengeId, { startDate: format(nextStart, 'yyyy-MM-dd'), completedAt: today })
    }
  }

  const isDayDone = (challengeId, dateKey = today) =>
    !!log[`${challengeId}_${dateKey}`]

  // ── Stats ──────────────────────────────────────────────────────────────────
  const getCompletedDays = (challengeId) =>
    Object.keys(log).filter(k => k.startsWith(`${challengeId}_`) && log[k]).length

  const getProgress = (c) =>
    Math.min(Math.round((getCompletedDays(c.id) / c.days) * 100), 100)

  const getDaysLeft = (c) =>
    Math.max(0, c.days - getCompletedDays(c.id))

  const getDaysElapsed = (c) => {
    const start = new Date(c.startDate)
    const now   = new Date()
    return Math.floor((now - start) / (1000 * 60 * 60 * 24))
  }

  const active   = challenges.filter(c => c.active && getCompletedDays(c.id) < c.days)
  const archived = challenges.filter(c => !c.active || getCompletedDays(c.id) >= c.days)

  return {
    challenges, active, archived,
    startChallenge, updateChallenge, deleteChallenge,
    toggleDay, isDayDone,
    getDaysLeft, getDaysElapsed, getCompletedDays, getProgress,
  }
}
