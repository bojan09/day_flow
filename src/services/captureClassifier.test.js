import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyCapture } from './captureClassifier.js'

test('falls back to task classification when AI call throws', async () => {
  const failingCaller = async () => { throw new Error('network down') }
  const result = await classifyCapture('call dentist tomorrow high priority', failingCaller)
  assert.equal(result.type, 'task')
  assert.equal(result.fields.priority, 'high')
  assert.ok(result.usedFallback)
})

test('parses a well-formed AI JSON response', async () => {
  const fakeCaller = async () => JSON.stringify({
    type: 'habit',
    fields: { name: 'Drink water', frequency: 'daily' },
  })
  const result = await classifyCapture('drink more water every day', fakeCaller)
  assert.equal(result.type, 'habit')
  assert.deepEqual(result.fields, { name: 'Drink water', frequency: 'daily' })
  assert.equal(result.usedFallback, false)
})

test('falls back to task classification when AI returns unparseable text', async () => {
  const fakeCaller = async () => 'not json at all'
  const result = await classifyCapture('finish the report friday', fakeCaller)
  assert.equal(result.type, 'task')
  assert.ok(result.usedFallback)
})

test('falls back when AI returns an unrecognized type', async () => {
  const fakeCaller = async () => JSON.stringify({ type: 'unknown-thing', fields: {} })
  const result = await classifyCapture('something weird', fakeCaller)
  assert.equal(result.type, 'task')
  assert.ok(result.usedFallback)
})

test('falls back when AI returns fields: null', async () => {
  const fakeCaller = async () => JSON.stringify({ type: 'task', fields: null })
  const result = await classifyCapture('something with null fields', fakeCaller)
  assert.equal(result.usedFallback, true)
  assert.equal(result.type, 'task')
})
