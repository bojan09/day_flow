// Tests: fastingModel — the timer must be derived from timestamps, and the
// window/challenge distinction must not blur.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  makePlan, startFast, fastProgress, formatDuration, completeFast,
  fastingStreak, fastingStats, MS_HOUR,
} from './fastingModel.js'

const T0 = Date.UTC(2026, 8, 4, 20, 0, 0) // 2026-09-04 20:00 UTC

test('a 16:8 plan means a 16 hour fast, not a 16 day commitment', () => {
  const plan = makePlan({ presetId: '16:8' })
  assert.equal(plan.fastHours, 16)
  assert.equal(plan.eatHours, 8)
  assert.equal(plan.challengeDays, null, 'a plan alone carries no challenge length')
})

test('challenge length is separate from the fasting window', () => {
  // The spec calls this out: a 30-day challenge is not a 30-day fast.
  const plan = makePlan({ presetId: '16:8', challengeDays: 30 })
  assert.equal(plan.fastHours, 16, 'window stays 16 hours')
  assert.equal(plan.challengeDays, 30, 'challenge is a separate count of days')
})

test('a custom plan keeps its own hours', () => {
  const plan = makePlan({ presetId: 'custom', fastHours: 17 })
  assert.equal(plan.fastHours, 17)
  assert.equal(plan.eatHours, 7)
})

test('progress is computed from the clock, not accumulated', () => {
  const fast = startFast(makePlan({ presetId: '16:8' }), T0)
  // Simulate the user closing the app and coming back 14.5 hours later.
  const p = fastProgress(fast, T0 + 14.5 * MS_HOUR)
  assert.equal(formatDuration(p.elapsedMs), '14h 30m')
  assert.equal(formatDuration(p.remainingMs), '1h 30m')
  assert.equal(p.percent, 91)
  assert.equal(p.reachedTarget, false)
})

test('elapsed time is right even after a very long absence', () => {
  const fast = startFast(makePlan({ presetId: '16:8' }), T0)
  const p = fastProgress(fast, T0 + 40 * MS_HOUR)
  assert.equal(p.reachedTarget, true)
  assert.equal(p.remainingMs, 0)
  assert.ok(p.percent > 100, 'going past target is shown, not clamped')
})

test('a fast that reaches its target is recorded as completed', () => {
  const fast = startFast(makePlan({ presetId: '16:8' }), T0)
  const rec = completeFast(fast, { endedAtMs: T0 + 16 * MS_HOUR })
  assert.equal(rec.completed, true)
  assert.equal(rec.targetHours, 16)
  assert.equal(rec.dateKey, '2026-09-04')
})

test('ending early is recorded plainly, not as a failure flag', () => {
  const fast = startFast(makePlan({ presetId: '16:8' }), T0)
  const rec = completeFast(fast, { endedAtMs: T0 + 10 * MS_HOUR, feeling: 'Hungry' })
  assert.equal(rec.completed, false)
  assert.equal(formatDuration(rec.actualMs), '10h 0m')
  assert.equal(rec.feeling, 'Hungry')
  assert.equal('failed' in rec, false, 'no failure vocabulary in the record')
})

test('streak counts consecutive days and tolerates today not started yet', () => {
  const recs = [
    { dateKey: '2026-09-03' }, { dateKey: '2026-09-02' }, { dateKey: '2026-09-01' },
  ]
  assert.equal(fastingStreak(recs, '2026-09-04'), 3)
  assert.equal(fastingStreak([...recs, { dateKey: '2026-09-04' }], '2026-09-04'), 4)
})

test('a gap ends the streak', () => {
  const recs = [{ dateKey: '2026-09-04' }, { dateKey: '2026-09-02' }]
  assert.equal(fastingStreak(recs, '2026-09-04'), 1)
})

test('streaks count any recorded fast, not only completed ones', () => {
  // Neutral consistency tracking — stopping early still counts as a day fasted.
  const recs = [{ dateKey: '2026-09-04', completed: false }, { dateKey: '2026-09-03', completed: true }]
  assert.equal(fastingStreak(recs, '2026-09-04'), 2)
})

test('stats summarise without judging', () => {
  const recs = [
    { dateKey: '2026-09-04', actualMs: 16 * MS_HOUR, completed: true },
    { dateKey: '2026-09-03', actualMs: 10 * MS_HOUR, completed: false },
    { dateKey: '2026-08-30', actualMs: 14 * MS_HOUR, completed: true },
  ]
  const s = fastingStats(recs, '2026-09-04')
  assert.equal(s.totalFasts, 3)
  assert.equal(s.completedFasts, 2)
  assert.equal(s.daysThisMonth, 2)
  assert.equal(s.daysThisYear, 3)
  assert.equal(formatDuration(s.longestMs), '16h 0m')
  assert.equal(s.currentStreak, 2)
  assert.equal(s.longestStreak, 2)
})

test('empty history is safe', () => {
  const s = fastingStats([], '2026-09-04')
  assert.equal(s.totalFasts, 0)
  assert.equal(s.currentStreak, 0)
  assert.equal(s.averageMs, 0)
})
