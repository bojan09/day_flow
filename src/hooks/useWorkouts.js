// Hook: useWorkouts
// Purpose: Workout session CRUD — log sessions with exercises, sets, reps, duration.
import { usePersistedState } from './usePersistedState'
import { getTodayKey, getDateKey } from '../utils/dateUtils'

const KEY = 'workouts'

export const WORKOUT_TYPES = [
  'Strength', 'Cardio', 'HIIT', 'Yoga',
  'Stretching', 'Running', 'Cycling', 'Swimming', 'Sport', 'Other',
]

export const MUSCLE_GROUPS = [
  'Full Body', 'Upper Body', 'Lower Body', 'Core',
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes',
]

export function useWorkouts() {
  const [sessions, setSessions] = usePersistedState(KEY, [])

  // ── Session CRUD ────────────────────────────────────────────────────────────

  const addSession = (data) => {
    const session = {
      id:           Date.now().toString(),
      title:        data.title?.trim()  || 'Workout',
      type:         data.type           || 'Strength',
      muscleGroups: data.muscleGroups   || [],
      date:         data.date           || getTodayKey(),
      durationMins: data.durationMins   || null,
      notes:        data.notes          || '',
      exercises:    data.exercises      || [],
      completed:    false,
      recurrence:   data.recurrence     || 'none',
      createdAt:    new Date().toISOString(),
    }
    setSessions(prev => [session, ...prev])
    return session
  }

  const updateSession = (id, updates) =>
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))

  const deleteSession = (id) =>
    setSessions(prev => prev.filter(s => s.id !== id))

  const toggleComplete = (id) =>
    setSessions(prev =>
      prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
    )

  // ── Sets within a session ──────────────────────────────────────────────────

  const toggleSet = (sessionId, exId, setId) =>
    setSessions(prev => prev.map(s =>
      s.id !== sessionId ? s : {
        ...s,
        exercises: s.exercises.map(e =>
          e.id !== exId ? e : {
            ...e,
            sets: e.sets.map(st =>
              st.id === setId ? { ...st, done: !st.done } : st
            ),
          }
        ),
      }
    ))

  // ── Queries ─────────────────────────────────────────────────────────────────

  const getByDate = (dateKey) => sessions.filter(s => s.date === dateKey)
  const getToday  = ()        => getByDate(getTodayKey())

  const getRecent = (n = 8) =>
    [...sessions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, n)

  const getTotalThisWeek = () => {
    const start = new Date()
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    return sessions.filter(s => new Date(s.createdAt) >= start).length
  }

  const getWeeklyVolume = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const dateKey = getDateKey(d)
      const day = getByDate(dateKey)
      return {
        dateKey,
        label:    d.toLocaleDateString('en', { weekday: 'short' }),
        count:    day.length,
        duration: day.reduce((s, w) => s + (w.durationMins || 0), 0),
      }
    })
  }

  const getPersonalBests = () => {
    const pbs = {}
    sessions.forEach(session => {
      session.exercises?.forEach(ex => {
        ex.sets?.forEach(set => {
          if (!set.weight || !set.reps) return
          const key = ex.name.toLowerCase().trim()
          if (!pbs[key] || Number(set.weight) > Number(pbs[key].weight)) {
            pbs[key] = {
              name:   ex.name,
              weight: set.weight,
              reps:   set.reps,
              unit:   set.unit || 'kg',
              date:   session.date,
            }
          }
        })
      })
    })
    return Object.values(pbs).sort((a, b) => b.date.localeCompare(a.date))
  }

  return {
    sessions,
    addSession, updateSession, deleteSession, toggleComplete, toggleSet,
    getByDate, getToday, getRecent,
    getTotalThisWeek, getWeeklyVolume, getPersonalBests,
  }
}
