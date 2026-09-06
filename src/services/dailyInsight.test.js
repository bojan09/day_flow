// Tests: dailyInsight — reports only real, repeated, self-reported patterns.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dailyInsight } from './dailyInsight.js'

test('nothing when the week has not accumulated enough data', () => {
  assert.equal(dailyInsight({ enough: false, topIntention: { value: 'Focused', count: 5 } }), null)
})

test('nothing when no pattern repeats at least 3 times', () => {
  assert.equal(dailyInsight({
    enough: true,
    topIntention: { value: 'Focused', count: 2 },
    topFeeling: { value: 'Calm', count: 1 },
  }), null)
})

test('surfaces the repeated intention as a plain count, no invented cause', () => {
  const insight = dailyInsight({
    enough: true,
    topIntention: { value: 'Focused', count: 4 },
    topFeeling: null,
  })
  assert.equal(insight, '4 days this week you set out to be focused.')
})

test('surfaces the repeated feeling when intention does not repeat enough', () => {
  const insight = dailyInsight({
    enough: true,
    topIntention: { value: 'Calm', count: 1 },
    topFeeling: { value: 'Scattered', count: 3 },
  })
  assert.equal(insight, '3 days this week felt scattered.')
})

test('picks whichever pattern repeated more when both qualify', () => {
  const insight = dailyInsight({
    enough: true,
    topIntention: { value: 'Focused', count: 3 },
    topFeeling: { value: 'Calm', count: 5 },
  })
  assert.equal(insight, '5 days this week felt calm.')
})

test('handles missing fields without throwing', () => {
  assert.equal(dailyInsight({ enough: true }), null)
  assert.equal(dailyInsight(null), null)
  assert.equal(dailyInsight(undefined), null)
})
