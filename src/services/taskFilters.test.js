import assert from 'node:assert/strict'
import test from 'node:test'
import { taskMatchesFilter } from './taskFilters.js'

const today = '2026-08-12'

test('Today excludes completed tasks even when their task date is today', () => {
  assert.equal(taskMatchesFilter({ date: today, completed: true }, 'Today', today), false)
  assert.equal(taskMatchesFilter({ date: today, completed: false }, 'Today', today), true)
})

test('Done and All retain completed tasks', () => {
  const completed = { date: today, completed: true }
  assert.equal(taskMatchesFilter(completed, 'Done', today), true)
  assert.equal(taskMatchesFilter(completed, 'All', today), true)
})
