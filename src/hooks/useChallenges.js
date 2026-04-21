// Hook: useChallenges
// Purpose: Time-boxed 7/30-day micro-habit challenges with progress tracking
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { differenceInDays, parseISO, format } from 'date-fns'
import { getTodayKey } from '../utils/dateUtils'

const KEY     = 'challenges'
const LOG_KEY = 'challenge_log'

export const CHALLENGE_PRESETS = [
  { title: 'No social media',    emoji: '📵', days: 7  },
  { title: 'Walk every day',     emoji: '🚶', days: 30 },
  { title: 'Read 10 pages/day',  emoji: '📖', days: 30 },
  { title: 'Cold shower',        emoji: '🚿', days: 7  },
  { title: 'No junk food',       emoji: '🥗', days: 14 },
  { title: 'Sleep by 10pm',      emoji: '😴', days: 7  },
  { title: 'Drink 8 glasses',    emoji: '💧', days: 14 },
  { title: 'Meditate 10 min',    emoji: '🧘', days: 21 },
]

export function useChallenges() {
  const [challenges, setChallenges] = useState(() => storage.get(KEY, []))
  const [log,        setLog]        = useState(() => storage.get(LOG_KEY, {}))

  useEffect(() => { storage.set(KEY,     challenges) }, [challenges])
  useEffect(() => { storage.set(LOG_KEY, log)        }, [log])

  const startChallenge = (data) => {
    const c = {
      id:        Date.now().toString(),
      title:     data.title.trim(),
      emoji:     data.emoji  || '🎯',
      days:      data.days   || 7,
      startDate: getTodayKey(),
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setChallenges(prev => [c, ...prev])
    return c
  }

  const deleteChallenge  = (id)     => setChallenges(prev => prev.filter(c => c.id !== id))
  const updateChallenge  = (id, up) => setChallenges(prev => prev.map(c => c.id === id ? { ...c, ...up } : c))

  const toggleDay = (challengeId, dateKey = getTodayKey()) => {
    const k = `${challengeId}_${dateKey}`
    setLog(prev => ({ ...prev, [k]: !prev[k] }))
  }

  const isDayDone    = (cId, dateKey = getTodayKey()) => !!log[`${cId}_${dateKey}`]

  const getDaysLeft  = (c) => {
    const elapsed = differenceInDays(new Date(), parseISO(c.startDate))
    return Math.max(0, c.days - elapsed)
  }

  const getDaysElapsed = (c) =>
    Math.min(c.days, differenceInDays(new Date(), parseISO(c.startDate)) + 1)

  const getCompletedDays = (c) => {
    let count = 0
    for (let i = 0; i < c.days; i++) {
      const d   = new Date(c.startDate)
      d.setDate(d.getDate() + i)
      if (log[`${c.id}_${format(d, 'yyyy-MM-dd')}`]) count++
    }
    return count
  }

  const isExpired = (c) => getDaysLeft(c) === 0

  const getProgress = (c) => Math.round((getDaysElapsed(c) / c.days) * 100)

  const active   = challenges.filter(c => !isExpired(c))
  const archived = challenges.filter(c => isExpired(c))

  return {
    challenges, active, archived,
    startChallenge, deleteChallenge, updateChallenge, toggleDay, isDayDone,
    getDaysLeft, getDaysElapsed, getCompletedDays, getProgress,
  }
}
