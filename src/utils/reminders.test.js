import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeReminderAt } from './reminders.js'

test('returns null when reminderTime is empty/null', () => {
  assert.equal(computeReminderAt('2026-07-20', ''), null)
  assert.equal(computeReminderAt('2026-07-20', null), null)
  assert.equal(computeReminderAt('2026-07-20', undefined), null)
})

test('returns null when date is empty/null', () => {
  assert.equal(computeReminderAt('', '09:00'), null)
  assert.equal(computeReminderAt(null, '09:00'), null)
})

test('combines date + time into a valid ISO timestamp', () => {
  const result = computeReminderAt('2026-07-20', '09:30')
  assert.ok(result, 'should return a non-null value')
  const d = new Date(result)
  assert.equal(d.getFullYear(), 2026)
  assert.equal(d.getMonth(), 6) // July = month index 6
  assert.equal(d.getDate(), 20)
  assert.equal(d.getHours(), 9)
  assert.equal(d.getMinutes(), 30)
})

test('output is a valid ISO 8601 string parseable by Date', () => {
  const result = computeReminderAt('2026-01-05', '23:45')
  assert.doesNotThrow(() => new Date(result).toISOString())
})
