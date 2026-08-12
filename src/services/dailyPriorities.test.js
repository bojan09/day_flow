import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeDailyPriorities } from './dailyPriorities.js'

test('keeps at most three unique incomplete existing task ids', () => {
  const result = normalizeDailyPriorities(['a', 'a', 'missing', 'b', 'c', 'd'], [
    { id: 'a', completed: false }, { id: 'b', completed: true },
    { id: 'c', completed: false }, { id: 'd', completed: false },
  ])
  assert.deepEqual(result, ['a', 'c', 'd'])
})

test('normalizes mixed numeric and string ids', () => {
  assert.deepEqual(normalizeDailyPriorities([1, '1', 2], [
    { id: 1, completed: false }, { id: 2, completed: false },
  ]), ['1', '2'])
})
