import assert from 'node:assert/strict'
import test from 'node:test'

import { canConvert, markConverted, normalizeInboxItem, visibleInboxItems } from './captureInbox.js'

test('normalizes and filters archived inbox items', () => {
  const open = normalizeInboxItem({ id: '1', text: 'One' })
  const archived = normalizeInboxItem({ id: '2', text: 'Two', status: 'archived' })
  assert.deepEqual(visibleInboxItems([archived, open]).map(item => item.id), ['1'])
})

test('records target ids and prevents duplicate conversion', () => {
  const item = normalizeInboxItem({ id: '1', text: 'One' })
  const converted = markConverted(item, 'task', 't1')
  assert.equal(converted.convertedId, 't1')
  assert.equal(canConvert(converted), false)
  assert.throws(() => markConverted(converted, 'note', 'n1'), /already converted/i)
})
