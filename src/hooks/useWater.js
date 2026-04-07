// Hook: useWater
// Purpose: Daily hydration counter — log glasses of water with goal tracking
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { getTodayKey } from '../utils/dateUtils'

const KEY  = 'water_log'
const GOAL = 8 // glasses per day

export function useWater() {
  const [log, setLog] = useState(() => storage.get(KEY, {}))
  useEffect(() => { storage.set(KEY, log) }, [log])

  const today = getTodayKey()

  const getTodayCount   = ()          => log[today] || 0
  const getCountForDate = (dateKey)   => log[dateKey] || 0

  const addGlass  = ()  => setLog(prev => ({ ...prev, [today]: (prev[today] || 0) + 1 }))
  const removeGlass = () =>
    setLog(prev => ({ ...prev, [today]: Math.max(0, (prev[today] || 0) - 1) }))

  const getProgress = () => {
    const count = getTodayCount()
    return { count, goal: GOAL, pct: Math.min(100, Math.round((count / GOAL) * 100)) }
  }

  return { getTodayCount, getCountForDate, addGlass, removeGlass, getProgress, GOAL }
}
