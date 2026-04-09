// Hook: useBalanceWheel
// Purpose: Life balance wheel — rate 8 life areas monthly and track over time
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { format } from 'date-fns'

const KEY = 'balance_wheel'

export const LIFE_AREAS = [
  { id: 'health',        label: 'Health',        emoji: '💪', color: '#3B6B4B' },
  { id: 'career',        label: 'Career',        emoji: '💼', color: '#3B82F6' },
  { id: 'relationships', label: 'Relationships', emoji: '❤️', color: '#EC4899' },
  { id: 'finance',       label: 'Finance',       emoji: '💰', color: '#F59E0B' },
  { id: 'fun',           label: 'Fun',           emoji: '🎉', color: '#8B5CF6' },
  { id: 'growth',        label: 'Growth',        emoji: '📈', color: '#06B6D4' },
  { id: 'environment',   label: 'Environment',   emoji: '🏡', color: '#84CC16' },
  { id: 'purpose',       label: 'Purpose',       emoji: '🎯', color: '#C4622D' },
]

export function useBalanceWheel() {
  const [entries, setEntries] = useState(() => storage.get(KEY, {}))
  useEffect(() => { storage.set(KEY, entries) }, [entries])

  const currentMonth = format(new Date(), 'yyyy-MM')

  const getMonthRatings = (monthKey = currentMonth) =>
    entries[monthKey] || Object.fromEntries(LIFE_AREAS.map(a => [a.id, 5]))

  const setRating = (areaId, value, monthKey = currentMonth) => {
    setEntries(prev => ({
      ...prev,
      [monthKey]: { ...(prev[monthKey] || {}), [areaId]: value },
    }))
  }

  const hasRated = (monthKey = currentMonth) =>
    !!entries[monthKey] && Object.keys(entries[monthKey]).length > 0

  const getAverage = (monthKey = currentMonth) => {
    const ratings = getMonthRatings(monthKey)
    const vals    = Object.values(ratings)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '5.0'
  }

  const getHistory = () =>
    Object.entries(entries)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)

  const getLowAreas = (threshold = 5) =>
    LIFE_AREAS.filter(a => (getMonthRatings()[a.id] || 5) < threshold)

  return { getMonthRatings, setRating, hasRated, getAverage, getHistory, getLowAreas }
}
