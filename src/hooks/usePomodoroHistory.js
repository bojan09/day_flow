// Hook: usePomodoroHistory
// Purpose: Log completed focus sessions and compute weekly productivity report
import { useEffect } from 'react'
import { usePersistedState } from './usePersistedState'
import { getTodayKey, getDateKey } from '../utils/dateUtils'
import { subDays, format } from 'date-fns'

const KEY = 'pomodoro_history'

export function usePomodoroHistory() {
  const [sessions, setSessions] = usePersistedState(KEY, [])

  const logSession = (durationMins = 25, taskTitle = '', taskId = null) => {
    setSessions(prev => [...prev, {
      id:           `${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      date:         getTodayKey(),
      durationMins,
      taskTitle,
      taskId,
      completedAt:  new Date().toISOString(),
    }])
  }

  const getTodaySessions   = ()       => sessions.filter(s => s.date === getTodayKey())
  const getTodayMins       = ()       => getTodaySessions().reduce((sum, s) => sum + s.durationMins, 0)

  const getWeeklyReport = () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d    = subDays(new Date(), 6 - i)
      const key  = getDateKey(d)
      const daySessions = sessions.filter(s => s.date === key)
      return {
        label:    format(d, 'EEE'),
        sessions: daySessions.length,
        mins:     daySessions.reduce((sum, s) => sum + s.durationMins, 0),
      }
    })

    const totalSessions = sessions.filter(s => {
      const d = subDays(new Date(), 6)
      return new Date(s.completedAt) >= d
    }).length

    const avgMins = totalSessions > 0
      ? Math.round(sessions.filter(s => {
          const d = subDays(new Date(), 6)
          return new Date(s.completedAt) >= d
        }).reduce((sum, s) => sum + s.durationMins, 0) / totalSessions)
      : 0

    const bestDay = days.reduce((b, d) => d.sessions > b.sessions ? d : b, days[0])

    return { days, totalSessions, avgMins, bestDay }
  }

  return { sessions, logSession, getTodaySessions, getTodayMins, getWeeklyReport }
}
