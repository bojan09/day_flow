// Hook: useRealtime
// Purpose: Subscribe to real-time Supabase changes — silent no-op in demo mode
import { useEffect, useRef, useCallback } from 'react'
import { subscribeToTables } from '../services/realtimeService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'

const WATCHED_TABLES = ['tasks', 'notes', 'habits', 'habit_log', 'goals', 'ideas', 'projects', 'bookmarks']

export function useRealtime(refetchMap = {}) {
  const { user }  = useAuth()
  const mapRef    = useRef(refetchMap)
  mapRef.current  = refetchMap

  const handleUpdate = useCallback((table, payload) => {
    try { mapRef.current[table]?.(payload) } catch {}
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) return
    const tables  = WATCHED_TABLES.filter(t => mapRef.current[t])
    if (!tables.length) return
    return subscribeToTables(tables, user.id, handleUpdate)
  }, [user?.id, handleUpdate])
}
