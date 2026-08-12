const VERSION_PREFIX = 'v2'
const LEGACY_PREFIX = 'dayflow_'

export function storageScope(userId, configured) {
  return configured && userId ? `user:${userId}` : 'demo'
}

export function scopedKey(scope, key) {
  if (!scope || !key) throw new Error('Storage scope and key are required')
  return `${VERSION_PREFIX}:${scope}:${key}`
}

export function createScopedStorage(backend) {
  const requireBackend = () => {
    if (!backend) throw new Error('Storage backend is unavailable')
    return backend
  }

  const read = (key, fallback) => {
    try {
      const item = requireBackend().getItem(key)
      return item === null ? fallback : JSON.parse(item)
    } catch {
      return fallback
    }
  }

  return {
    get(scope, key, fallback = null) {
      return read(scopedKey(scope, key), fallback)
    },

    set(scope, key, value) {
      try {
        requireBackend().setItem(scopedKey(scope, key), JSON.stringify(value))
        return true
      } catch (error) {
        console.error('[DayFlow] Storage write failed:', error)
        return false
      }
    },

    remove(scope, key) {
      try {
        requireBackend().removeItem(scopedKey(scope, key))
        return true
      } catch {
        return false
      }
    },

    readLegacy(key, fallback = null) {
      return read(`${LEGACY_PREFIX}${key}`, fallback)
    },
  }
}
