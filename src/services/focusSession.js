const MAX_DURATION_SECS = 240 * 60

function validateDuration(durationSecs) {
  if (!Number.isInteger(durationSecs) || durationSecs < 60 || durationSecs > MAX_DURATION_SECS) {
    throw new Error('Focus duration must be an integer from 1 to 240 minutes')
  }
}

export function startSession({ taskId, durationSecs }, now = Date.now()) {
  if (!taskId) throw new Error('A task is required to start focus')
  validateDuration(durationSecs)
  return {
    taskId: String(taskId),
    durationSecs,
    remainingSecs: durationSecs,
    status: 'running',
    startedAt: now,
    lastTransitionAt: now,
    elapsedSecs: 0,
  }
}

export function remainingAt(session, now = Date.now()) {
  if (!session) return 0
  if (session.status !== 'running') return Math.max(0, session.remainingSecs)
  const elapsed = Math.max(0, Math.floor((now - session.lastTransitionAt) / 1000))
  return Math.max(0, session.remainingSecs - elapsed)
}

export function pauseSession(session, now = Date.now()) {
  if (!session || session.status !== 'running') return session
  const remainingSecs = remainingAt(session, now)
  const elapsed = Math.max(0, session.remainingSecs - remainingSecs)
  return {
    ...session,
    remainingSecs,
    status: remainingSecs === 0 ? 'finished' : 'paused',
    lastTransitionAt: now,
    elapsedSecs: session.elapsedSecs + elapsed,
  }
}

export function continueSession(session, now = Date.now()) {
  if (!session || session.status !== 'paused') return session
  return { ...session, status: 'running', lastTransitionAt: now }
}

export function finishSession(session, now = Date.now()) {
  if (!session) return null
  return pauseSession(session, now) ?? session
}

export function stopSession() {
  return null
}
