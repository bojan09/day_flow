// Hook: useIntention
// Purpose: Store and retrieve the daily "Today I intend to..." intention per day
import { useEffect } from 'react'
import { usePersistedState } from './usePersistedState'
import { getTodayKey } from '../utils/dateUtils'

const KEY = 'intentions'

export function useIntention() {
  const [intentions, setIntentions] = usePersistedState(KEY, {})

  const today = getTodayKey()

  const getTodayIntention = () => intentions[today] || ''

  const setTodayIntention = (text) =>
    setIntentions(prev => ({ ...prev, [today]: text }))

  const getIntentionForDate = (dateKey) => intentions[dateKey] || ''

  return { getTodayIntention, setTodayIntention, getIntentionForDate }
}
