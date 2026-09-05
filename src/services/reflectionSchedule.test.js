// Tests: reflectionSchedule — the morning must not roll into the evening.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reflectionPhase, dueReflection, shouldRemind, promptCopy } from './reflectionSchedule.js'

test('phases split the day at 5, 12, 17 and 22', () => {
  assert.equal(reflectionPhase(3),  'night')
  assert.equal(reflectionPhase(8),  'morning')
  assert.equal(reflectionPhase(13), 'midday')
  assert.equal(reflectionPhase(19), 'evening')
  assert.equal(reflectionPhase(23), 'night')
})

test('the morning is due in the morning', () => {
  assert.equal(dueReflection({ hour: 8, morningDone: false, eveningDone: false }), 'morning')
})

test('finishing the morning does NOT open the evening', () => {
  // The reported bug: pressing continue at the end of the morning dropped the
  // user straight into "how did your day go?" at 8am.
  assert.equal(dueReflection({ hour: 8, morningDone: true, eveningDone: false }), null)
  assert.equal(dueReflection({ hour: 11, morningDone: true, eveningDone: false }), null)
  assert.equal(dueReflection({ hour: 14, morningDone: true, eveningDone: false }), null)
})

test('a missed morning stays available through midday', () => {
  assert.equal(dueReflection({ hour: 13, morningDone: false, eveningDone: false }), 'morning')
  assert.equal(dueReflection({ hour: 16, morningDone: false, eveningDone: false }), 'morning')
})

test('the evening opens at 17:00', () => {
  assert.equal(dueReflection({ hour: 16, morningDone: true, eveningDone: false }), null)
  assert.equal(dueReflection({ hour: 17, morningDone: true, eveningDone: false }), 'evening')
})

test('the evening is offered even if the morning was skipped', () => {
  // Missing the morning should not lock you out of closing the day.
  assert.equal(dueReflection({ hour: 20, morningDone: false, eveningDone: false }), 'evening')
})

test('late night still counts as the evening', () => {
  assert.equal(dueReflection({ hour: 23, morningDone: true, eveningDone: false }), 'evening')
})

test('nothing is due once both halves are done', () => {
  assert.equal(dueReflection({ hour: 20, morningDone: true, eveningDone: true }), null)
  assert.equal(dueReflection({ hour: 8,  morningDone: true, eveningDone: true }), null)
})

test('reminds once per half, never twice', () => {
  assert.equal(shouldRemind({ hour: 8, morningDone: false, eveningDone: false }), 'morning')
  assert.equal(shouldRemind({ hour: 8, morningDone: false, eveningDone: false, remindedFor: ['morning'] }), null)
  assert.equal(shouldRemind({ hour: 19, morningDone: true, eveningDone: false, remindedFor: ['morning'] }), 'evening')
})

test('no dawn ambush before 07:00', () => {
  assert.equal(shouldRemind({ hour: 5, morningDone: false, eveningDone: false }), null)
  assert.equal(shouldRemind({ hour: 7, morningDone: false, eveningDone: false }), 'morning')
})

test('prompt copy differs per half', () => {
  assert.match(promptCopy('morning').title, /Begin/)
  assert.match(promptCopy('evening').title, /Close/)
  assert.equal(promptCopy(null), null)
})
