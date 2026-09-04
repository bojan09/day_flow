// Tests: reflectionModel — the shape/merge rules behind Daily Reflection.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  emptyReflection, mergeReflection, isMorningDone, isEveningDone,
  shardKeyFor, previousDateKey, reflectionStreak,
} from './reflectionModel.js'

test('a fresh entry is neither morning nor evening complete', () => {
  const e = emptyReflection('2026-09-04')
  assert.equal(isMorningDone(e), false)
  assert.equal(isEveningDone(e), false)
  assert.equal(e.dateKey, '2026-09-04')
})

test('completion is driven by the submit stamp, not by filled-in content', () => {
  // A user can skip every optional field and still have finished the morning.
  const filled = mergeReflection(null, { intention: 'Focused' }, '2026-09-04')
  assert.equal(isMorningDone(filled), false)

  const submitted = mergeReflection(filled, { morningDoneAt: '2026-09-04T07:00:00Z' }, '2026-09-04')
  assert.equal(isMorningDone(submitted), true)
  assert.equal(isEveningDone(submitted), false)
})

test('the evening sitting does not clobber the morning sitting', () => {
  const morning = mergeReflection(null, {
    intention: 'Patient', inControl: 'When I start', morningDoneAt: 'ts',
  }, '2026-09-04')

  const evening = mergeReflection(morning, {
    wentWell: 'Started early', livedIntention: 'partially', eveningDoneAt: 'ts2',
  }, '2026-09-04')

  assert.equal(evening.intention, 'Patient')
  assert.equal(evening.inControl, 'When I start')
  assert.equal(evening.morningDoneAt, 'ts')
  assert.equal(evening.wentWell, 'Started early')
  assert.equal(evening.livedIntention, 'partially')
})

test('unknown keys are dropped so the stored shape cannot drift', () => {
  const e = mergeReflection(null, { intention: 'Calm', bogusField: 'x' }, '2026-09-04')
  assert.equal(e.intention, 'Calm')
  assert.equal('bogusField' in e, false)
})

test('an explicit empty string still overwrites — clearing an answer works', () => {
  const first  = mergeReflection(null, { wentWell: 'typo' }, '2026-09-04')
  const second = mergeReflection(first, { wentWell: '' }, '2026-09-04')
  assert.equal(second.wentWell, '')
})

test('entries shard by month', () => {
  assert.equal(shardKeyFor('2026-09-04'), 'reflections_2026-09')
  assert.equal(shardKeyFor('2026-12-31'), 'reflections_2026-12')
})

test('previousDateKey crosses months and years', () => {
  assert.equal(previousDateKey('2026-09-04'), '2026-09-03')
  assert.equal(previousDateKey('2026-09-01'), '2026-08-31')
  assert.equal(previousDateKey('2026-01-01'), '2025-12-31')
})

test('streak counts consecutive evenings, ignoring an unfinished today', () => {
  const done = (d) => ({ dateKey: d, eveningDoneAt: 'ts' })
  const entries = {
    '2026-09-03': done('2026-09-03'),
    '2026-09-02': done('2026-09-02'),
    '2026-09-01': done('2026-09-01'),
  }
  // Today isn't reflected on yet — the run so far should still count.
  assert.equal(reflectionStreak(entries, '2026-09-04'), 3)
  // And once today is done it counts too.
  entries['2026-09-04'] = done('2026-09-04')
  assert.equal(reflectionStreak(entries, '2026-09-04'), 4)
})

test('a gap ends the streak', () => {
  const entries = {
    '2026-09-04': { eveningDoneAt: 'ts' },
    // 09-03 missing
    '2026-09-02': { eveningDoneAt: 'ts' },
  }
  assert.equal(reflectionStreak(entries, '2026-09-04'), 1)
})

test('a morning-only day does not count toward the streak', () => {
  const entries = { '2026-09-03': { morningDoneAt: 'ts' } }
  assert.equal(reflectionStreak(entries, '2026-09-04'), 0)
})
