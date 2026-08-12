import assert from 'node:assert/strict'
import test from 'node:test'

import { getNextAction, rankNextActions, scoreTask } from './nextAction.js'

const now = new Date('2026-08-12T10:00:00')
const context = { now, dailyPriorityIds: [], projects: [] }
const task = overrides => ({
  id: 'task', title: 'Task', date: '2026-08-12', priority: 'medium',
  completed: false, createdAt: '2026-08-01T10:00:00Z', ...overrides,
})

test('excludes completed tasks and paused recurring templates', () => {
  assert.equal(scoreTask(task({ completed: true }), context), null)
  assert.equal(scoreTask(task({ isRecurring: true, recurStatus: 'paused' }), context), null)
})

test('overdue high priority outranks low priority today when neither is pinned', () => {
  const ranked = rankNextActions([
    task({ id: 'today', priority: 'low' }),
    task({ id: 'late', date: '2026-08-10', priority: 'high' }),
  ], context)

  assert.equal(ranked[0].task.id, 'late')
  assert.ok(ranked[0].reasons.some(reason => reason.code === 'overdue'))
})

test('pinned and Daily Big 3 weights are explicit', () => {
  const result = scoreTask(task({ id: 'a', isFocus: true }), {
    ...context, dailyPriorityIds: ['a'],
  })
  assert.ok(result.reasons.some(reason => reason.code === 'pinned' && reason.score === 120))
  assert.ok(result.reasons.some(reason => reason.code === 'daily-priority' && reason.score === 80))
})

test('caps overdue age and future penalties', () => {
  const old = scoreTask(task({ date: '2025-01-01' }), context)
  const future = scoreTask(task({ date: '2026-09-01' }), context)
  assert.equal(old.reasons.find(reason => reason.code === 'overdue').score, 90)
  assert.equal(future.reasons.find(reason => reason.code === 'future').score, -100)
})

test('scores scheduled proximity, estimates, progress, and near project due dates', () => {
  const result = scoreTask(task({
    dueTime: '10:30', estimateMins: 30, startedAt: '2026-08-12T09:00:00Z', projectId: 'p1',
  }), {
    ...context,
    projects: [{ id: 'p1', status: 'Active', dueDate: '2026-08-15' }],
  })
  for (const code of ['scheduled-soon', 'short', 'started', 'project-due']) {
    assert.ok(result.reasons.some(reason => reason.code === code), code)
  }
})

test('treats invalid dates as unscheduled and resolves ties deterministically', () => {
  const ranked = rankNextActions([
    task({ id: 'b', date: 'invalid', createdAt: '2026-08-01T10:00:00Z' }),
    task({ id: 'a', date: 'invalid', createdAt: '2026-08-01T10:00:00Z' }),
  ], context)
  assert.deepEqual(ranked.map(item => item.task.id), ['a', 'b'])
  assert.equal(getNextAction([], context), null)
})
