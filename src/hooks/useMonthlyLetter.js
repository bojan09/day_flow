// Hook: useMonthlyLetter
// Purpose: Store monthly reflection letters, prompt on 1st of month
import { useEffect } from 'react'
import { usePersistedState } from './usePersistedState'
import { format } from 'date-fns'

const KEY = 'monthly_letters'

export function useMonthlyLetter() {
  const [letters, setLetters] = usePersistedState(KEY, {})

  const currentMonthKey = format(new Date(), 'yyyy-MM')
  const isFirstOfMonth  = new Date().getDate() === 1

  const getCurrentLetter   = ()          => letters[currentMonthKey] || null
  const getLetterForMonth  = (monthKey)  => letters[monthKey] || null

  const saveLetter = (content) =>
    setLetters(prev => ({
      ...prev,
      [currentMonthKey]: { content, month: currentMonthKey, savedAt: new Date().toISOString() }
    }))

  const getAllLetters = () =>
    Object.values(letters).sort((a, b) => b.month.localeCompare(a.month))

  const shouldPrompt = isFirstOfMonth && !getCurrentLetter()

  return { getCurrentLetter, getLetterForMonth, saveLetter, getAllLetters, shouldPrompt, currentMonthKey }
}
