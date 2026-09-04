// Tests: useSyncedCollection failure paths.
// syncReconcile.test.js and withRetry.test.js cover the pieces; this covers the
// wiring — that a write which never lands tells the user, clears its guard, and
// lets the caller roll back its optimistic update. Runs under vitest because it
// needs the app's own module resolution and a DOM.
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, cleanup } from '@testing-library/react'

const toastCalls = []
// In-memory stand-in: this Node build doesn't expose localStorage to jsdom,
// and the hook's storage writes aren't what these tests are about.
const store = new Map()

vi.mock('../services/storage', () => ({
  storage: {
    get: (k, fallback) => (store.has(k) ? store.get(k) : fallback),
    set: (k, v) => store.set(k, v),
    remove: (k) => store.delete(k),
  },
}))
vi.mock('./useAuth', () => ({ useAuth: () => ({ user: { id: 'test-user' } }) }))
vi.mock('../services/supabaseClient', () => ({
  isSupabaseConfigured: () => true,
  supabase: {},
}))
vi.mock('../services/realtimeService', () => ({
  subscribeToTable:  () => () => {},
  subscribeToTables: () => () => {},
}))
vi.mock('../utils/toast', () => ({
  useToast: () => ({
    toast: {
      error:   (m) => toastCalls.push(['error', m]),
      success: (m) => toastCalls.push(['success', m]),
      info: () => {}, default: () => {}, undo: () => {},
    },
  }),
}))

const { useSyncedCollection } = await import('./useSyncedCollection')

const okService = {
  getAll: async () => [],
  upsert: async () => {},
  delete: async () => {},
}

// Renders the hook and hands the live value back for assertions.
function mountHook(service) {
  const box = {}
  function Probe() {
    box.api = useSyncedCollection({ storageKey: 'test_items', table: 'test_items', service })
    return null
  }
  render(<Probe />)
  return box
}

describe('useSyncedCollection failure handling', () => {
  beforeEach(() => { toastCalls.length = 0; store.clear() })
  afterEach(() => cleanup())

  test('a write that keeps failing toasts the user and invokes the caller rollback', async () => {
    let attempts = 0
    const service = { ...okService, upsert: async () => { attempts++; throw new Error('network down') } }

    const box = mountHook(service)
    let rolledBack = false
    await act(async () => {
      await box.api.persist({ id: 'x1', title: 'hello' }, { onFail: () => { rolledBack = true } })
    })

    expect(attempts).toBeGreaterThan(1)          // retried, not a single shot
    expect(rolledBack).toBe(true)                // caller can undo its optimistic update
    expect(toastCalls).toEqual([['error', 'Save failed — check your connection']])
  })

  test('a write that succeeds neither toasts nor rolls back', async () => {
    const box = mountHook(okService)
    let rolledBack = false
    await act(async () => {
      await box.api.persist({ id: 'x2', title: 'fine' }, { onFail: () => { rolledBack = true } })
    })

    expect(rolledBack).toBe(false)
    expect(toastCalls).toEqual([])
  })

  test('a write that fails once then succeeds stays silent', async () => {
    let attempts = 0
    const service = {
      ...okService,
      upsert: async () => { attempts++; if (attempts === 1) throw new Error('blip') },
    }

    const box = mountHook(service)
    let rolledBack = false
    await act(async () => {
      await box.api.persist({ id: 'x4', title: 'flaky' }, { onFail: () => { rolledBack = true } })
    })

    expect(attempts).toBe(2)
    expect(rolledBack).toBe(false)
    expect(toastCalls).toEqual([])   // a recovered write must not alarm the user
  })

  test('a failing delete toasts and reports failure', async () => {
    const service = { ...okService, delete: async () => { throw new Error('network down') } }

    const box = mountHook(service)
    let failed = false
    await act(async () => {
      await box.api.remove('x3', { onFail: () => { failed = true } })
    })

    expect(failed).toBe(true)
    expect(toastCalls).toEqual([['error', 'Delete failed — check your connection']])
  })
})
