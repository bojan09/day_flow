// Tests: useTasks — completing a task must actually reach the server.
//
// Regression for the long-standing "I check it, refresh, and it comes back
// unchecked" bug. toggleTask assigned its target inside the setTasks updater
// and read it on the next line, before React had run that updater, so the
// value was still null and the write was never issued.
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, cleanup } from '@testing-library/react'

const persisted = []
const removed   = []

vi.mock('./useSyncedCollection', () => ({
  useSyncedCollection: () => {
    const React = require('react')
    const [items, setItems] = React.useState([
      { id: 't1', title: 'Walk', date: '2026-09-05', completed: false, completedAt: null, isFocus: false },
    ])
    return {
      items,
      setItems,
      synced: true,
      persist: (item, opts) => { persisted.push({ item, opts }) },
      remove:  (id) => { removed.push(id) },
      unmarkDeleted: () => {},
      useDB: false,
      userId: null,
    }
  },
}))

const { useTasks } = await import('./useTasks')

function mount() {
  const box = {}
  function Probe() {
    const api = useTasks()
    box.api = api
    return null
  }
  render(<Probe />)
  return box
}

describe('useTasks', () => {
  beforeEach(() => { persisted.length = 0; removed.length = 0 })
  afterEach(() => cleanup())

  test('completing a task issues a write', async () => {
    const box = mount()
    await act(async () => { box.api.toggleTask('t1') })

    expect(persisted).toHaveLength(1)
    expect(persisted[0].item.id).toBe('t1')
    expect(persisted[0].item.completed).toBe(true)
    expect(persisted[0].item.completedAt).toBeTruthy()
  })

  test('the completed flag survives in local state too', async () => {
    const box = mount()
    await act(async () => { box.api.toggleTask('t1') })
    expect(box.api.tasks.find(t => t.id === 't1').completed).toBe(true)
  })

  test('un-completing writes as well and clears completedAt', async () => {
    const box = mount()
    await act(async () => { box.api.toggleTask('t1') })
    await act(async () => { box.api.toggleTask('t1') })
    expect(persisted).toHaveLength(2)
    expect(persisted[1].item.completed).toBe(false)
    expect(persisted[1].item.completedAt).toBe(null)
  })

  test('a failed write rolls the checkbox back', async () => {
    const box = mount()
    await act(async () => { box.api.toggleTask('t1') })
    expect(box.api.tasks.find(t => t.id === 't1').completed).toBe(true)

    await act(async () => { persisted[0].opts.onFail('Save failed') })
    expect(box.api.tasks.find(t => t.id === 't1').completed).toBe(false)
  })

  test('editing a task issues a write', async () => {
    const box = mount()
    await act(async () => { box.api.updateTask('t1', { title: 'Walk further' }) })
    expect(persisted).toHaveLength(1)
    expect(persisted[0].item.title).toBe('Walk further')
  })

  test('toggling an unknown id is a no-op, not a crash', async () => {
    const box = mount()
    await act(async () => { box.api.toggleTask('nope') })
    expect(persisted).toHaveLength(0)
  })
})
