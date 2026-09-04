// Tests: withRetry — the retry/backoff contract that useSyncedCollection's
// persist() and remove() rely on for their failure toasts and rollbacks.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withRetry } from './withRetry.js'

const noDelay = { baseDelay: 0 }

test('returns the result and never calls onFail when the operation succeeds', async () => {
  let onFailCalls = 0
  const result = await withRetry(async () => 'ok', { ...noDelay, onFail: () => { onFailCalls++ } })
  assert.equal(result, 'ok')
  assert.equal(onFailCalls, 0)
})

test('retries a failing operation and succeeds if a later attempt works', async () => {
  let attempts = 0
  let onFailCalls = 0
  const result = await withRetry(async () => {
    attempts++
    if (attempts < 3) throw new Error('transient')
    return 'recovered'
  }, { ...noDelay, onFail: () => { onFailCalls++ } })

  assert.equal(result, 'recovered')
  assert.equal(attempts, 3)
  assert.equal(onFailCalls, 0, 'a run that eventually succeeds must not report failure')
})

test('gives up after maxRetries and reports failure exactly once', async () => {
  let attempts = 0
  const failures = []
  const result = await withRetry(async () => {
    attempts++
    throw new Error('always down')
  }, {
    ...noDelay,
    maxRetries: 2,
    errorMessage: 'Save failed — check your connection',
    onFail: (message, err) => failures.push([message, err?.message]),
  })

  assert.equal(result, null, 'exhausted retries resolve to null rather than throwing')
  assert.equal(attempts, 3, 'initial attempt plus maxRetries')
  assert.equal(failures.length, 1)
  assert.deepEqual(failures[0], ['Save failed — check your connection', 'always down'])
})

test('does not reject when the operation always throws', async () => {
  // persist()/remove() call this without a catch — a rejection here would
  // surface as an unhandled promise rejection on every failed write.
  await assert.doesNotReject(() =>
    withRetry(async () => { throw new Error('boom') }, { ...noDelay, maxRetries: 1 })
  )
})

test('works with no options at all', async () => {
  assert.equal(await withRetry(async () => 42), 42)
})
