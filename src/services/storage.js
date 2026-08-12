// Service: scoped browser storage plus a legacy compatibility wrapper.
import { createScopedStorage } from './scopedStorage'

const browserStorage = {
  getItem: key => globalThis.localStorage?.getItem(key) ?? null,
  setItem: (key, value) => globalThis.localStorage?.setItem(key, value),
  removeItem: key => globalThis.localStorage?.removeItem(key),
}

export const scopedStorage = createScopedStorage(browserStorage)

export const storage = {
  get: (key, fallback = null) => scopedStorage.readLegacy(key, fallback),
  set: (key, value) => scopedStorage.set('demo', key, value),
  remove: key => scopedStorage.remove('demo', key),
}
