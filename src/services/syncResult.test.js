import assert from 'node:assert/strict'
import test from 'node:test'

import {
  remoteFailure,
  remoteSuccess,
  resolveRemoteValue,
} from './syncResult.js'

test('successful empty result replaces cached records', () => {
  assert.deepEqual(
    resolveRemoteValue(['cached'], remoteSuccess([])),
    { value: [], stale: false },
  )
})

test('failed result preserves same-user cache and marks stale', () => {
  const error = new Error('offline')
  assert.deepEqual(
    resolveRemoteValue(['cached'], remoteFailure(error)),
    { value: ['cached'], stale: true, error },
  )
})

test('normalizes non-Error failures', () => {
  const result = remoteFailure('offline')
  assert.equal(result.ok, false)
  assert.match(result.error.message, /offline/)
})
