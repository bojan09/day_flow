// Tests: captureClassifier — now fully local. These assert the on-device rules
// that replaced the AI call, so capture keeps working offline and cannot be
// broken by an upstream model being retired.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyCapture } from './captureClassifier.js'

test('plain text becomes a task', () => {
  const r = classifyCapture('Email the landlord')
  assert.equal(r.type, 'task')
  assert.ok(r.fields.title)
})

test('"every day" prefix becomes a habit', () => {
  const r = classifyCapture('every day drink water')
  assert.equal(r.type, 'habit')
  assert.equal(r.fields.name, 'drink water')
  assert.equal(r.fields.frequency, 'daily')
})

test('"routine:" prefix becomes a routine', () => {
  const r = classifyCapture('routine: morning deep work')
  assert.equal(r.type, 'routine')
  assert.equal(r.fields.name, 'morning deep work')
  assert.deepEqual(r.fields.steps, [])
})

test('a clock time makes it an event', () => {
  const r = classifyCapture('Dentist at 3pm')
  assert.equal(r.type, 'event')
  assert.ok(r.fields.title)
})

test('empty input is safe', () => {
  const r = classifyCapture('')
  assert.equal(r.type, 'task')
  assert.equal(r.fields.title, '')
})

test('classification is synchronous but still awaitable', async () => {
  // Call sites use `await classifyCapture(text)`; awaiting a plain value works.
  const r = await classifyCapture('Buy milk')
  assert.equal(r.type, 'task')
})
