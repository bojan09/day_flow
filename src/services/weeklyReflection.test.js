// Tests: weeklyReflection — the "after enough data exists" gate and the tallies.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  weekDateKeys, buildWeeklyReflection, MIN_DAYS_FOR_WEEKLY,
} from './weeklyReflection.js'

const TODAY = '2026-09-10'

const done = (dateKey, extra = {}) => ({
  dateKey, eveningDoneAt: 'ts', ...extra,
})

test('the week window is 7 days ending today, most recent first', () => {
  const keys = weekDateKeys(TODAY)
  assert.equal(keys.length, 7)
  assert.equal(keys[0], '2026-09-10')
  assert.equal(keys[6], '2026-09-04')
})

test('the weekly view stays hidden until enough days are reflected on', () => {
  const entries = {
    '2026-09-10': done('2026-09-10'),
    '2026-09-09': done('2026-09-09'),
  }
  const weekly = buildWeeklyReflection(entries, TODAY)
  assert.equal(weekly.daysReflected, 2)
  assert.equal(weekly.enough, false, `needs ${MIN_DAYS_FOR_WEEKLY}`)
})

test('it opens once the threshold is met', () => {
  const entries = {
    '2026-09-10': done('2026-09-10'),
    '2026-09-09': done('2026-09-09'),
    '2026-09-08': done('2026-09-08'),
  }
  assert.equal(buildWeeklyReflection(entries, TODAY).enough, true)
})

test('mornings without a completed evening do not count', () => {
  const entries = {
    '2026-09-10': { dateKey: '2026-09-10', morningDoneAt: 'ts' },
    '2026-09-09': { dateKey: '2026-09-09', morningDoneAt: 'ts' },
    '2026-09-08': done('2026-09-08'),
  }
  assert.equal(buildWeeklyReflection(entries, TODAY).daysReflected, 1)
})

test('days outside the window are ignored', () => {
  const entries = {
    '2026-09-10': done('2026-09-10'),
    '2026-09-01': done('2026-09-01'), // 9 days back
    '2026-08-30': done('2026-08-30'),
  }
  assert.equal(buildWeeklyReflection(entries, TODAY).daysReflected, 1)
})

test('tallies intention outcomes without scoring them', () => {
  const entries = {
    '2026-09-10': done('2026-09-10', { livedIntention: 'yes' }),
    '2026-09-09': done('2026-09-09', { livedIntention: 'partially' }),
    '2026-09-08': done('2026-09-08', { livedIntention: 'not_today' }),
    '2026-09-07': done('2026-09-07', { livedIntention: 'yes' }),
  }
  const w = buildWeeklyReflection(entries, TODAY)
  assert.deepEqual(w.lived, { yes: 2, partially: 1, not_today: 1 })
})

test('surfaces the most chosen intention and most common feeling', () => {
  const entries = {
    '2026-09-10': done('2026-09-10', { intention: 'Focused', dayFelt: 'Scattered' }),
    '2026-09-09': done('2026-09-09', { intention: 'Focused', dayFelt: 'Calm' }),
    '2026-09-08': done('2026-09-08', { intention: 'Patient', dayFelt: 'Scattered' }),
  }
  const w = buildWeeklyReflection(entries, TODAY)
  assert.deepEqual(w.topIntention, { value: 'Focused', count: 2 })
  assert.deepEqual(w.topFeeling,   { value: 'Scattered', count: 2 })
})

test('collects the lessons and carry-forwards the user actually wrote', () => {
  const entries = {
    '2026-09-10': done('2026-09-10', { lesson: 'Mornings are my best hours.', carryForward: 'Start earlier.' }),
    '2026-09-09': done('2026-09-09', { lesson: '   ', carryForward: '' }),
    '2026-09-08': done('2026-09-08', { lesson: 'Batching messages helps.' }),
  }
  const w = buildWeeklyReflection(entries, TODAY)
  assert.equal(w.lessons.length, 2, 'blank lessons are skipped')
  assert.equal(w.carried.length, 1)
})

test('an empty week is safe', () => {
  const w = buildWeeklyReflection({}, TODAY)
  assert.equal(w.daysReflected, 0)
  assert.equal(w.enough, false)
  assert.equal(w.topIntention, null)
  assert.deepEqual(w.lessons, [])
})
