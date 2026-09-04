// Tests: daySummary — the evening's factual picture, and the guard that keeps
// the AI quiet when there is nothing real to reflect on.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildDaySummary, summaryLines, hasEnoughContextForAI } from './daySummary.js'

const DAY = '2026-09-04'

const tasksApi = (list) => ({ tasks: list })
const habitsApi = (list, doneIds = []) => ({
  habits: list,
  isHabitDone: (id) => doneIds.includes(id),
})

test('counts only the given day', () => {
  const s = buildDaySummary({
    dateKey: DAY,
    tasks: tasksApi([
      { id: 'a', date: DAY, completed: true },
      { id: 'b', date: DAY, completed: false },
      { id: 'c', date: '2026-09-03', completed: true }, // yesterday — excluded
    ]),
  })
  assert.deepEqual(s.tasks, { completed: 1, total: 2 })
})

test('counts habits done for that day', () => {
  const s = buildDaySummary({
    dateKey: DAY,
    habits: habitsApi([{ id: 'h1' }, { id: 'h2' }, { id: 'h3' }], ['h1', 'h3']),
  })
  assert.deepEqual(s.habits, { completed: 2, total: 3 })
})

test('sums focus sessions and minutes', () => {
  const s = buildDaySummary({ dateKey: DAY, focusSessions: [{ mins: 25 }, { mins: 25 }, { mins: 15 }] })
  assert.equal(s.focusSessions, 3)
  assert.equal(s.focusMinutes, 65)
})

test('reports whether the morning priority was finished', () => {
  const s = buildDaySummary({
    dateKey: DAY,
    tasks: tasksApi([{ id: 'p1', date: DAY, completed: true }]),
    reflection: { priorityTaskId: 'p1', priorityText: 'Ship the slice' },
  })
  assert.equal(s.priorityDone, true)
  assert.equal(s.priority, 'Ship the slice')
})

test('a free-text priority has no completion state to report', () => {
  const s = buildDaySummary({
    dateKey: DAY,
    tasks: tasksApi([]),
    reflection: { priorityText: 'Be present with family', priorityTaskId: null },
  })
  assert.equal(s.priorityDone, null)
})

test('summary carries no score, grade or percentage', () => {
  // Guards the spec's "do not turn this into a performance score".
  const s = buildDaySummary({
    dateKey: DAY,
    tasks: tasksApi([{ id: 'a', date: DAY, completed: true }]),
  })
  const keys = JSON.stringify(s).toLowerCase()
  for (const banned of ['score', 'grade', 'percent', 'rating']) {
    assert.equal(keys.includes(banned), false, `summary must not expose a ${banned}`)
  }
})

test('empty categories are omitted rather than shown as zeros', () => {
  const lines = summaryLines(buildDaySummary({
    dateKey: DAY,
    tasks: tasksApi([{ id: 'a', date: DAY, completed: true }]),
  }))
  assert.equal(lines.length, 1)
  assert.equal(lines[0].label, 'Tasks completed')
})

test('AI stays silent when the user wrote nothing', () => {
  const summary = buildDaySummary({ dateKey: DAY, tasks: tasksApi([{ id: 'a', date: DAY, completed: true }]) })
  assert.equal(hasEnoughContextForAI(summary, {}), false)
  assert.equal(hasEnoughContextForAI(summary, { wentWell: 'ok' }), false, 'a two-word answer is not context')
})

test('AI speaks once there is a real written answer plus day data', () => {
  const summary = buildDaySummary({ dateKey: DAY, tasks: tasksApi([{ id: 'a', date: DAY, completed: true }]) })
  assert.equal(hasEnoughContextForAI(summary, { wentWell: 'Started the hard task before email.' }), true)
})

test('AI can speak on writing alone when there is no tracked day data', () => {
  const summary = buildDaySummary({ dateKey: DAY })
  assert.equal(hasEnoughContextForAI(summary, { wentWell: 'Stayed calm in the meeting.' }), false)
  assert.equal(
    hasEnoughContextForAI(summary, {
      wentWell: 'Stayed calm in the meeting.',
      lesson: 'I do better when I prepare the night before.',
    }),
    true,
  )
})
