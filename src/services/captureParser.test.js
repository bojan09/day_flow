import assert from 'node:assert/strict'
import test from 'node:test'

import { parseCapture } from './captureParser.js'

const now = new Date('2026-08-12T09:00:00')

test('parses tomorrow at 2 without treating 2 as a calendar day', () => {
  const result = parseCapture('Call John tomorrow at 2', 'task', now)
  assert.equal(result.fields.title, 'Call John')
  assert.equal(result.fields.date, '2026-08-13')
  assert.equal(result.fields.dueTime, '14:00')
})

test('parses 24-hour time, weekdays, duration, priority, and category', () => {
  const result = parseCapture('Finish report Friday 14:30 2 hours urgent work', 'task', now)
  assert.equal(result.fields.date, '2026-08-14')
  assert.equal(result.fields.dueTime, '14:30')
  assert.equal(result.fields.estimateMins, 120)
  assert.equal(result.fields.priority, 'high')
  assert.equal(result.fields.category, 'Work')
  assert.equal(result.fields.title, 'Finish report')
})

test('honors prefixes and explicit types', () => {
  assert.equal(parseCapture('?Build a garden app', null, now).type, 'idea')
  assert.equal(parseCapture('Remember this', 'note', now).type, 'note')
  assert.equal(parseCapture('!Buy 2 monitors', null, now).fields.title, 'Buy 2 monitors')
})

test('does not treat ordinary title numbers as dates', () => {
  const result = parseCapture('Review chapter 7', 'task', now)
  assert.equal(result.fields.title, 'Review chapter 7')
  assert.equal(result.fields.date, '2026-08-12')
})

test('creates reminder fields and rejects blank captures', () => {
  const result = parseCapture('Take medicine at 8pm', 'reminder', now)
  assert.equal(result.type, 'reminder')
  assert.equal(result.fields.dueTime, '20:00')
  assert.equal(result.fields.reminderTime, '20:00')
  assert.throws(() => parseCapture('   ', 'task', now), /blank/i)
})
