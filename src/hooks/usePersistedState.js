// Hook: owner-scoped local persistence with optional Supabase KV sync.
import { useEffect, useRef, useState } from 'react'
import { scopedStorage } from '../services/storage'
import { storageScope } from '../services/scopedStorage'
import { kvService } from '../services/supabaseDataService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'
import { useOfflineQueueContext } from './useOfflineQueue'

export function usePersistedState(key, defaultValue) {
  const { user } = useAuth()
  const userId = user?.id
  const configured = isSupabaseConfigured()
  const useDB = configured && !!userId
  const scope = storageScope(userId, configured)
  const offline = useOfflineQueueContext()
  const defaultRef = useRef(defaultValue)
  const [value, setValueRaw] = useState(() => scopedStorage.get(scope, key, defaultRef.current))

  useEffect(() => {
    let active = true
    const fallback = scope === 'demo' ? scopedStorage.readLegacy(key, defaultRef.current) : defaultRef.current
    setValueRaw(scopedStorage.get(scope, key, fallback))
    if (!useDB) return () => { active = false }

    kvService.get(userId, key).then(result => {
      if (!active) return
      if (result.ok) {
        const remote = result.value ?? defaultRef.current
        setValueRaw(remote)
        scopedStorage.set(scope, key, remote)
      } else {
        console.warn(`[DayFlow] usePersistedState(${key}): load failed, keeping same-user cache`)
      }
    })
    return () => { active = false }
  }, [key, scope, useDB, userId])

  const setValue = updater => {
    setValueRaw(previous => {
      const next = typeof updater === 'function' ? updater(previous) : updater
      scopedStorage.set(scope, key, next)

      if (useDB) {
        if (offline?.safeWrite) {
          offline.safeWrite(
            `kv:${key}`,
            { userId, key, value: next },
            payload => kvService.set(payload.userId, payload.key, payload.value),
          ).catch(error => console.error(`[DayFlow] usePersistedState(${key}):`, error?.message))
        } else {
          kvService.set(userId, key, next).catch(error =>
            console.error(`[DayFlow] usePersistedState(${key}):`, error?.message),
          )
        }
      }
      return next
    })
  }

  return [value, setValue]
}
