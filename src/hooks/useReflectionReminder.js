// Hook: useReflectionReminder
// Purpose: Watch the clock while the app is open and raise one quiet local
//          notification when a half of the reflection becomes due.
//
// At most one per half per day, tracked per date so it resets tomorrow. This
// is a nudge, not a nag — the spec warns explicitly against repeatedly pushing
// the reflection at the user.
import { useEffect, useRef, useState } from 'react'
import { usePersistedState } from './usePersistedState'
import { getTodayKey } from '../utils/dateUtils'
import { dueReflection, shouldRemind, promptCopy } from '../services/reflectionSchedule'

const CHECK_MS = 60_000

export function useReflectionReminder({ morningDone, eveningDone, enabled = true }) {
  const dateKey = getTodayKey()
  const [log, setLog] = usePersistedState('reflection_reminders', {})
  const [, setTick]   = useState(0)
  const firing = useRef(false)

  const remindedFor = log?.[dateKey] || []
  const hour = new Date().getHours()
  const due  = dueReflection({ hour, morningDone, eveningDone })

  // Re-evaluate every minute so the evening prompt appears the moment 17:00
  // arrives, without the user having to reload.
  useEffect(() => {
    if (!enabled) return
    const t = setInterval(() => setTick(n => n + 1), CHECK_MS)
    return () => clearInterval(t)
  }, [enabled])

  useEffect(() => {
    if (!enabled || firing.current) return
    const now  = new Date().getHours()
    const half = shouldRemind({ hour: now, morningDone, eveningDone, remindedFor })
    if (!half) return

    firing.current = true
    // Record first: a notification that fails to render must still not repeat
    // on every tick.
    setLog(prev => ({ ...(prev || {}), [dateKey]: [...((prev || {})[dateKey] || []), half] }))

    const copy = promptCopy(half)
    if (copy && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification(copy.title, {
          body: copy.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `reflection-${half}-${dateKey}`,
        })
        setTimeout(() => n.close(), 8000)
      } catch { /* notification unavailable — the in-app prompt still shows */ }
    }
    firing.current = false
  })

  return { due, remindedFor }
}
