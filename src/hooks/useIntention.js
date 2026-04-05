// Hook: useIntention
// Purpose: Store and retrieve the daily "Today I intend to..." intention per day
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { getTodayKey } from '../utils/dateUtils'

const KEY = 'intentions'

export function useIntention() {
  const [intentions, setIntentions] = useState(() => storage.get(KEY, {}))

  useEffect(() => { storage.set(KEY, intentions) }, [intentions])

  const today = getTodayKey()

  const getTodayIntention = () => intentions[today] || ''

  const setTodayIntention = (text) =>
    setIntentions(prev => ({ ...prev, [today]: text }))

  const getIntentionForDate = (dateKey) => intentions[dateKey] || ''

  return { getTodayIntention, setTodayIntention, getIntentionForDate }
}
