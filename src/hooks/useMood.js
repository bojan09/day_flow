// Hook: useMood
// Purpose: Track daily mood entries (emoji + note) with history access

import { usePersistedState } from './usePersistedState'
import { getTodayKey } from '../utils/dateUtils'

const KEY = 'moods'

export const MOODS = [
  { emoji: '😄', label: 'Great',   score: 5 },
  { emoji: '🙂', label: 'Good',    score: 4 },
  { emoji: '😐', label: 'Okay',    score: 3 },
  { emoji: '😔', label: 'Low',     score: 2 },
  { emoji: '😞', label: 'Rough',   score: 1 },
]

export function useMood() {
  const [moods, setMoods] = usePersistedState(KEY, {})

  const setTodayMood = (moodScore, note = '') => {
    setMoods(prev => ({
      ...prev,
      [getTodayKey()]: { score: moodScore, note, date: getTodayKey(), loggedAt: new Date().toISOString() },
    }))
  }

  const getTodayMood = () => moods[getTodayKey()] ?? null

  const getMoodForDate = (dateKey) => moods[dateKey] ?? null

  // Last 30 entries sorted by date
  const getHistory = (days = 30) =>
    Object.values(moods)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, days)

  const getAverageScore = (days = 7) => {
    const history = getHistory(days)
    if (!history.length) return 0
    const sum = history.reduce((acc, m) => acc + m.score, 0)
    return (sum / history.length).toFixed(1)
  }

  return { moods, setTodayMood, getTodayMood, getMoodForDate, getHistory, getAverageScore }
}
