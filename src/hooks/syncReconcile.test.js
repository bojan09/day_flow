// Tests: syncReconcile — the optimistic-update race logic every synced
// collection (tasks, goals, notes, ideas, projects, bookmarks) depends on.
// These cover the exact scenarios that produced shipped bugs.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reconcileRows, shouldIgnoreFetch } from './syncReconcile.js'

const rows = (...ids) => ids.map(id => ({ id, completed: false, from: 'server' }))

test('passes rows straight through when nothing is in flight', () => {
  const out = reconcileRows(rows('a', 'b'), new Map(), new Set())
  assert.deepEqual(out.map(r => r.id), ['a', 'b'])
  assert.equal(out.every(r => r.from === 'server'), true)
})

test('a pending write wins over the server row it races', () => {
  // The bug this prevents: toggling a task complete, then a realtime refetch
  // resolving with pre-write data and reverting the checkbox.
  const pending = new Map([['a', { id: 'a', completed: true, from: 'local' }]])
  const out = reconcileRows(rows('a', 'b'), pending, new Set())

  assert.equal(out.find(r => r.id === 'a').completed, true)
  assert.equal(out.find(r => r.id === 'a').from, 'local')
  assert.equal(out.find(r => r.id === 'b').from, 'server', 'untouched rows stay server-authoritative')
})

test('a pending delete is not resurrected by a fetch that still returns it', () => {
  const out = reconcileRows(rows('a', 'b'), new Map(), new Set(['a']))
  assert.deepEqual(out.map(r => r.id), ['b'])
})

test('a record written locally but absent from the server is kept', () => {
  // A just-created record the server read hasn't caught up with yet.
  const pending = new Map([['new', { id: 'new', from: 'local' }]])
  const out = reconcileRows(rows('a'), pending, new Set())
  assert.deepEqual(out.map(r => r.id).sort(), ['a', 'new'])
})

test('delete guard beats write guard for the same id', () => {
  const pending = new Map([['a', { id: 'a', from: 'local' }]])
  const out = reconcileRows(rows('a'), pending, new Set(['a']))
  assert.equal(out.some(r => r.id === 'a'), true,
    'the pending write re-adds it — deleting and restoring in one tick keeps the restored copy')
})

test('does not mutate the inputs', () => {
  const input = rows('a', 'b')
  const pending = new Map([['a', { id: 'a', from: 'local' }]])
  const deletes = new Set(['b'])
  reconcileRows(input, pending, deletes)

  assert.equal(input.length, 2)
  assert.equal(input[0].from, 'server')
  assert.equal(pending.size, 1)
  assert.equal(deletes.size, 1)
})

test('ignores an empty fetch when local state has data', () => {
  // getAll() returns [] on query failure too, so applying it would wipe the
  // UI and the localStorage cache behind it.
  assert.equal(shouldIgnoreFetch([], [{ id: 'a' }]), true)
})

test('accepts an empty fetch when local state is also empty', () => {
  assert.equal(shouldIgnoreFetch([], []), false)
})

test('always accepts a non-empty fetch', () => {
  assert.equal(shouldIgnoreFetch([{ id: 'a' }], []), false)
  assert.equal(shouldIgnoreFetch([{ id: 'a' }], [{ id: 'b' }]), false)
})
