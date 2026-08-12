import assert from 'node:assert/strict'
import test from 'node:test'

import { operationKey, replayOperations } from './offlineOperations.js'

test('does not replay another user operation', async () => {
  const calls = []
  const result = await replayOperations([
    { id: '1', ownerId: 'a', type: 'kv:set', entityId: 'prefs', payload: {} },
  ], 'b', { 'kv:set': async operation => calls.push(operation) })

  assert.equal(calls.length, 0)
  assert.equal(result.remaining.length, 1)
  assert.equal(result.foreign.length, 1)
})

test('keeps unknown operation types queued', async () => {
  const result = await replayOperations([
    { id: '1', ownerId: 'a', type: 'unknown', entityId: 'x', payload: {} },
  ], 'a', {})

  assert.equal(result.remaining.length, 1)
  assert.match(result.errors[0].message, /unknown operation/i)
})

test('keeps failed operations and increments attempts', async () => {
  const result = await replayOperations([
    { id: '1', ownerId: 'a', type: 'kv:set', entityId: 'prefs', payload: {}, attempts: 2 },
  ], 'a', { 'kv:set': async () => { throw new Error('offline') } })

  assert.equal(result.remaining[0].attempts, 3)
  assert.equal(result.completed.length, 0)
})

test('uses stable operation deduplication keys', () => {
  assert.equal(operationKey('kv:set', 'preferences'), 'kv:set:preferences')
})
