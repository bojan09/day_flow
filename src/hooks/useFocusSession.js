import { useCallback, useEffect, useState } from 'react'
import { usePersistedState } from './usePersistedState'
import {
  continueSession,
  pauseSession,
  remainingAt,
  startSession,
  stopSession,
} from '../services/focusSession'

export function useFocusSession() {
  const [session, setSession] = usePersistedState('focus_session', null)
  const [remainingSecs, setRemainingSecs] = useState(() => remainingAt(session))

  const refresh = useCallback(() => {
    if (!session) { setRemainingSecs(0); return }
    const remaining = remainingAt(session)
    setRemainingSecs(remaining)
    if (session.status === 'running' && remaining === 0) {
      setSession(previous => pauseSession(previous, Date.now()))
    }
  }, [session, setSession])

  useEffect(() => {
    refresh()
    if (session?.status !== 'running') return
    const interval = setInterval(refresh, 1000)
    const visible = () => { if (!document.hidden) refresh() }
    document.addEventListener('visibilitychange', visible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', visible)
    }
  }, [refresh, session?.status])

  return {
    session,
    remainingSecs,
    start: (taskId, minutes) => setSession(startSession({ taskId, durationSecs: Number(minutes) * 60 })),
    pause: () => setSession(previous => pauseSession(previous)),
    continue: () => setSession(previous => continueSession(previous)),
    stop: () => setSession(previous => stopSession(previous)),
    clear: () => setSession(null),
  }
}
