// Hook: usePersistedState
// Purpose: Drop-in useState that syncs to Supabase KV table.
//          Writes go through the offline queue so data is never lost when offline.
//          Falls back to localStorage when Supabase is not configured.
import { useState, useEffect, useRef } from 'react'
import { storage } from '../services/storage'
import { kvService } from '../services/supabaseDataService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'
import { useOfflineQueueContext } from './useOfflineQueue'

export function usePersistedState(key, defaultValue) {
  const { user }   = useAuth()
  const userId     = user?.id
  const useDB      = isSupabaseConfigured() && !!userId
  const loadedRef  = useRef(false)
  const offline    = useOfflineQueueContext()

  // Read from localStorage immediately — no loading flash
  const [value, setValueRaw] = useState(() => storage.get(key, defaultValue))

  // Load remote value once on mount / user change
  useEffect(() => {
    if (!useDB) return
    loadedRef.current = false
    kvService.get(userId, key).then(remote => {
      // FIX: only overwrite local state if remote has actual data
      // Prevents empty Supabase response from wiping good localStorage data
      const isEmpty = remote === null || remote === undefined ||
        (Array.isArray(remote) && remote.length === 0) ||
        (typeof remote === 'object' && !Array.isArray(remote) && Object.keys(remote).length === 0)

      if (!isEmpty) {
        setValueRaw(remote)
        storage.set(key, remote)
      }
      loadedRef.current = true
    }).catch(() => {
      // Network error — keep existing local data, don't overwrite
      console.warn(`[DayFlow] usePersistedState(${key}): load failed, keeping local data`)
      loadedRef.current = true
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, key])

  // Mirror of the current value, updated synchronously by setValue below so
  // two calls in the same tick compose correctly.
  const valueRef = useRef(value)
  useEffect(() => { valueRef.current = value }, [value])

  const setValue = (updater) => {
    // BUG FIX: the write used to live inside the setState updater. React only
    // runs an updater when it processes the update, so "save then navigate"
    // — completing a form and switching view in the same tick — unmounted the
    // component first and the write never happened. React may also invoke an
    // updater twice, which double-wrote. Resolving the value and persisting it
    // here makes the write unconditional and exactly-once.
    const next = typeof updater === 'function' ? updater(valueRef.current) : updater
    valueRef.current = next

    // localStorage first — zero data loss
    storage.set(key, next)

    // Then Supabase — via the offline queue when one is available
    if (useDB) {
      if (offline?.safeWrite) {
        offline.safeWrite(
          `kv:${key}`,
          { userId, key, value: next },
          ({ userId, key, value }) => kvService.set(userId, key, value)
        ).catch(err => console.error(`[DayFlow] usePersistedState(${key}):`, err?.message))
      } else {
        kvService.set(userId, key, next).catch(err =>
          console.error(`[DayFlow] usePersistedState(${key}):`, err?.message)
        )
      }
    }

    setValueRaw(next)
  }

  return [value, setValue]
}
