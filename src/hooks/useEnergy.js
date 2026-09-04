// Hook: useEnergy
// Purpose: Store daily peak energy window and derive smart task scheduling suggestions

import { usePersistedState } from './usePersistedState'
import { getTodayKey } from '../utils/dateUtils'

const KEY = 'energy_log'

export const ENERGY_WINDOWS = [
  { id: 'morning',   label: 'Morning',   emoji: '🌅', hours: '6–11am',  desc: 'Peak focus early' },
  { id: 'afternoon', label: 'Afternoon', emoji: '☀️', hours: '12–4pm', desc: 'Steady momentum'  },
  { id: 'evening',   label: 'Evening',   emoji: '🌆', hours: '5–9pm',  desc: 'Creative energy'  },
]

export function useEnergy() {
  const [log, setLog] = usePersistedState(KEY, {})

  const today = getTodayKey()

  const getTodayEnergy  = ()        => log[today] || null
  const setTodayEnergy  = (window)  =>
    setLog(prev => ({ ...prev, [today]: { window, loggedAt: new Date().toISOString() } }))

  const getEnergyForDate = (dateKey) => log[dateKey] || null

  const getSuggestion = () => {
    const e = getTodayEnergy()
    if (!e) return null
    const tips = {
      morning:   'Schedule your hardest tasks before noon.',
      afternoon: 'Tackle focused work between 1–3pm.',
      evening:   'Save creative and planning tasks for tonight.',
    }
    return tips[e.window] || null
  }

  return { getTodayEnergy, setTodayEnergy, getEnergyForDate, getSuggestion }
}
