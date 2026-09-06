// Tests: mementoMori — appears occasionally, never invents a quote.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shouldShowMementoMori, mementoMoriForDate } from './mementoMori.js'

const FAKE_POOL = [
  { id: 'a', quote: 'A', author: 'X', themes: ['control'] },
  { id: 'b', quote: 'B', author: 'Y', themes: ['mortality'] },
  { id: 'c', quote: 'C', author: 'Z', themes: ['mortality', 'time'] },
]

test('is stable for a given day — same input, same answer', () => {
  const a = shouldShowMementoMori('2026-09-06')
  const b = shouldShowMementoMori('2026-09-06')
  assert.equal(a, b)
})

test('does not show on every day', () => {
  const days = Array.from({ length: 30 }, (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`)
  const shown = days.filter(shouldShowMementoMori)
  assert.ok(shown.length > 0, 'should show at least sometimes')
  assert.ok(shown.length < days.length, 'must not show every day')
})

test('only ever returns a themed entry from the given pool — never invents one', () => {
  // Force a date known to pass the gate, then confirm the result is a member
  // of the supplied pool rather than synthesized text.
  const shownDay = Array.from({ length: 40 }, (_, i) => `2026-01-${String((i % 28) + 1).padStart(2, '0')}`)
    .find(shouldShowMementoMori)
  assert.ok(shownDay, 'fixture setup: need at least one day that shows')

  const ref = mementoMoriForDate(shownDay, FAKE_POOL)
  assert.ok(ref, 'a shown day must return a reference')
  assert.ok(FAKE_POOL.includes(ref), 'must be an actual pool entry, not invented')
  assert.ok(ref.themes.includes('mortality'))
})

test('returns null on a day the gate does not pass', () => {
  // Find a day where the gate is false, confirm null regardless of pool.
  const hiddenDay = Array.from({ length: 40 }, (_, i) => `2026-02-${String((i % 28) + 1).padStart(2, '0')}`)
    .find(d => !shouldShowMementoMori(d))
  assert.ok(hiddenDay, 'fixture setup: need at least one hidden day')
  assert.equal(mementoMoriForDate(hiddenDay, FAKE_POOL), null)
})

test('returns null if the pool has no mortality-themed entry', () => {
  const shownDay = Array.from({ length: 40 }, (_, i) => `2026-03-${String((i % 28) + 1).padStart(2, '0')}`)
    .find(shouldShowMementoMori)
  const noMortalityPool = [{ id: 'x', quote: 'x', author: 'x', themes: ['control'] }]
  assert.equal(mementoMoriForDate(shownDay, noMortalityPool), null)
})
