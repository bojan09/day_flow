// Hook: usePersistedState
// Purpose: Drop-in replacement for useState that persists to Supabase user_data KV table.
//          Falls back to localStorage when Supabase is not configured.
//          Pattern: const [value, setValue] = usePersistedState('my_key', defaultValue)
import { useState, useEffect, useRef } from 'react'
import { storage } from '../services/storage'
import { kvService } from '../services/supabaseDataService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'

export function usePersistedState(key, defaultValue) {
  const { user }  = useAuth()
  const userId    = user?.id
  const useDB     = isSupabaseConfigured() && !!userId
  const loadedRef = useRef(false)

  // Initialise from localStorage immediately (no loading flash)
  const [value, setValueRaw] = useState(() => storage.get(key, defaultValue))

  // Load from Supabase once on mount / user change
  useEffect(() => {
    if (!useDB) return
    loadedRef.current = false

    kvService.get(userId, key).then(remote => {
      if (remote !== null) {
        setValueRaw(remote)
        storage.set(key, remote)  // keep localStorage in sync for instant future reads
      }
      loadedRef.current = true
    })
  }, [userId, key])

  // Save to both localStorage and Supabase on every change (after initial load)
  const setValue = (updater) => {
    setValueRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      // Always write to localStorage (instant, offline support)
      storage.set(key, next)
      // Write to Supabase if configured
      if (useDB) {
        kvService.set(userId, key, next).catch(err =>
          console.error(`[DayFlow] usePersistedState(${key}):`, err.message)
        )
      }
      return next
    })
  }

  return [value, setValue]
}
