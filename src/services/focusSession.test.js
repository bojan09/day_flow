import assert from 'node:assert/strict'
import test from 'node:test'

import {
  continueSession,
  pauseSession,
  remainingAt,
  startSession,
  stopSession,
} from './focusSession.js'

test('derives remaining time across a reload', () => {
  const started = startSession({ taskId: 't1', durationSecs: 1500 }, 1_000)
  assert.equal(remainingAt(started, 61_000), 1440)
})

test('pause freezes time and continue resumes it', () => {
  const started = startSession({ taskId: 't1', durationSecs: 1500 }, 1_000)
  const paused = pauseSession(started, 61_000)
  assert.equal(remainingAt(paused, 999_000), 1440)
  assert.equal(paused.elapsedSecs, 60)
  const resumed = continueSession(paused, 100_000)
  assert.equal(remainingAt(resumed, 160_000), 1380)
})

test('expires at zero and stop clears the session', () => {
  const started = startSession({ taskId: 't1', durationSecs: 60 }, 0)
  assert.equal(remainingAt(started, 61_000), 0)
  assert.equal(stopSession(started), null)
})

test('rejects missing tasks and invalid durations', () => {
  assert.throws(() => startSession({ taskId: '', durationSecs: 60 }, 0), /task/i)
  assert.throws(() => startSession({ taskId: 't1', durationSecs: 0 }, 0), /duration/i)
  assert.throws(() => startSession({ taskId: 't1', durationSecs: 14_401 }, 0), /duration/i)
})
