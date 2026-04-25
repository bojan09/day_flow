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
      if (remote !== null) {
        setValueRaw(remote)
        storage.set(key, remote)
      }
      loadedRef.current = true
    })
  }, [userId, key])

  const setValue = (updater) => {
    setValueRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater

      // Always write to localStorage first — zero data loss
      storage.set(key, next)

      // Write to Supabase — via offline queue if available, direct otherwise
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

      return next
    })
  }

  return [value, setValue]
}
