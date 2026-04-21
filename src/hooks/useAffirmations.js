// Hook: useAffirmations
// Purpose: Store personal affirmations and surface them as a daily rotating reminder
import { useEffect } from 'react'
import { usePersistedState } from './usePersistedState'

const KEY = 'affirmations'

const DEFAULTS = [
  'I am capable of achieving my goals.',
  'I show up with focus and intention every day.',
  'I am constantly growing and improving.',
]

export function useAffirmations() {
  const [affirmations, setAffirmations] = usePersistedState(KEY, DEFAULTS)

  const addAffirmation    = (text)    => {
    if (!text.trim()) return
    setAffirmations(prev => [...prev, text.trim()])
  }

  const removeAffirmation = (index) =>
    setAffirmations(prev => prev.filter((_, i) => i !== index))

  const updateAffirmation = (index, text) =>
    setAffirmations(prev => prev.map((a, i) => i === index ? text : a))

  // Rotate based on day of year so it changes daily
  const getDailyAffirmation = () => {
    if (!affirmations.length) return null
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    return affirmations[dayOfYear % affirmations.length]
  }

  return { affirmations, addAffirmation, removeAffirmation, updateAffirmation, getDailyAffirmation }
}
