// Hook: useRealtime
// Purpose: Subscribe to real-time Supabase changes and sync local state instantly
// Wraps subscribeToTables and triggers refetch callbacks when changes arrive
import { useEffect, useRef, useCallback } from 'react'
import { subscribeToTables } from '../services/realtimeService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'

const WATCHED_TABLES = ['tasks', 'notes', 'habits', 'habit_log', 'goals', 'ideas', 'projects', 'bookmarks']

/**
 * Pass a map of table → refetch function.
 * When a remote change arrives, the matching refetch is called.
 *
 * Example:
 *   useRealtime({
 *     tasks:    () => tasks.refetch(),
 *     notes:    () => notes.refetch(),
 *   })
 */
export function useRealtime(refetchMap = {}) {
  const { user }     = useAuth()
  const mapRef       = useRef(refetchMap)
  mapRef.current     = refetchMap   // keep ref fresh without re-subscribing

  const handleUpdate = useCallback((table, payload) => {
    const fn = mapRef.current[table]
    if (typeof fn === 'function') fn(payload)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) return
    const tables  = WATCHED_TABLES.filter(t => mapRef.current[t])
    const cleanup = subscribeToTables(tables, user.id, handleUpdate)
    return cleanup
  }, [user?.id, handleUpdate])
}

/** Convenience hook that subscribes to a single table */
export function useRealtimeTable(table, userId, onUpdate) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return
    const { subscribeToTable } = require('../services/realtimeService')
    return subscribeToTable(table, userId, onUpdate)
  }, [table, userId])
}
