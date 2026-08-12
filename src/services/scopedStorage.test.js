import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createScopedStorage,
  scopedKey,
  storageScope,
} from './scopedStorage.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  }
}

test('keeps two users task caches separate', () => {
  const storage = createScopedStorage(memoryStorage())
  storage.set('user:a', 'tasks', [{ id: 'a1' }])
  storage.set('user:b', 'tasks', [{ id: 'b1' }])

  assert.deepEqual(storage.get('user:a', 'tasks', []), [{ id: 'a1' }])
  assert.deepEqual(storage.get('user:b', 'tasks', []), [{ id: 'b1' }])
})

test('uses device scope only for non-sensitive preferences', () => {
  assert.equal(scopedKey('device', 'pwa_install_dismissed'), 'v2:device:pwa_install_dismissed')
})

test('selects authenticated and demo scopes deterministically', () => {
  assert.equal(storageScope('abc', true), 'user:abc')
  assert.equal(storageScope(null, true), 'demo')
  assert.equal(storageScope('abc', false), 'demo')
})

test('returns fallbacks for malformed values and supports legacy reads', () => {
  const backend = memoryStorage()
  backend.setItem('v2:demo:broken', '{')
  backend.setItem('dayflow_tasks', JSON.stringify([{ id: 'legacy' }]))
  const storage = createScopedStorage(backend)

  assert.deepEqual(storage.get('demo', 'broken', []), [])
  assert.deepEqual(storage.readLegacy('tasks', []), [{ id: 'legacy' }])
})
