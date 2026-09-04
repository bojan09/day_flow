// Tests: usePersistedState — the write must survive the component unmounting
// in the same tick, which is what "save then navigate away" does.
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, cleanup } from '@testing-library/react'

const store = new Map()
const kvWrites = []

vi.mock('../services/storage', () => ({
  storage: {
    get: (k, fallback) => (store.has(k) ? store.get(k) : fallback),
    set: (k, v) => store.set(k, v),
    remove: (k) => store.delete(k),
  },
}))
vi.mock('./useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
vi.mock('../services/supabaseClient', () => ({ isSupabaseConfigured: () => true, supabase: {} }))
vi.mock('../services/supabaseDataService', () => ({
  kvService: {
    get: async () => null,
    set: async (userId, key, value) => { kvWrites.push({ key, value }) },
  },
}))
vi.mock('./useOfflineQueue', () => ({ useOfflineQueueContext: () => null }))

const { usePersistedState } = await import('./usePersistedState')

function mount(key, initial) {
  const box = {}
  function Probe() {
    const [value, setValue] = usePersistedState(key, initial)
    box.value = value
    box.setValue = setValue
    return null
  }
  const utils = render(<Probe />)
  return { box, utils }
}

describe('usePersistedState', () => {
  beforeEach(() => { store.clear(); kvWrites.length = 0 })
  afterEach(() => cleanup())

  test('persists even when the component unmounts in the same tick', async () => {
    const { box, utils } = mount('notes_key', {})

    await act(async () => {
      box.setValue({ a: 1 })
      utils.unmount()          // exactly what "save then navigate" does
    })

    expect(store.get('notes_key')).toEqual({ a: 1 })
    expect(kvWrites.at(-1)).toEqual({ key: 'notes_key', value: { a: 1 } })
  })

  test('two updates in the same tick compose instead of clobbering', async () => {
    const { box } = mount('compose_key', { count: 0 })

    await act(async () => {
      box.setValue(prev => ({ ...prev, count: prev.count + 1 }))
      box.setValue(prev => ({ ...prev, flagged: true }))
    })

    // The second updater must see the first one's result.
    expect(store.get('compose_key')).toEqual({ count: 1, flagged: true })
    expect(box.value).toEqual({ count: 1, flagged: true })
  })

  test('writes once per call, not twice', async () => {
    const { box } = mount('once_key', {})
    await act(async () => { box.setValue({ x: 1 }) })
    expect(kvWrites.filter(w => w.key === 'once_key')).toHaveLength(1)
  })

  test('a plain value works as well as an updater function', async () => {
    const { box } = mount('plain_key', 'a')
    await act(async () => { box.setValue('b') })
    expect(box.value).toBe('b')
    expect(store.get('plain_key')).toBe('b')
  })
})
