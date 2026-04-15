// Service: realtimeService
// Purpose: Subscribe to Supabase real-time channels for live cross-device data sync
// Each subscription calls an onUpdate callback when remote changes arrive
import { supabase, isSupabaseConfigured } from './supabaseClient'

const activeChannels = new Map()

/**
 * Subscribe to changes on a Supabase table for a given user.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 */
export function subscribeToTable(table, userId, onUpdate) {
  if (!isSupabaseConfigured() || !userId) return () => {}

  const channelKey = `${table}:${userId}`

  // Remove any existing subscription for this table
  if (activeChannels.has(channelKey)) {
    supabase.removeChannel(activeChannels.get(channelKey))
    activeChannels.delete(channelKey)
  }

  const channel = supabase
    .channel(channelKey)
    .on(
      'postgres_changes',
      {
        event:  '*',          // INSERT, UPDATE, DELETE
        schema: 'public',
        table,
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload)
      }
    )
    .subscribe()

  activeChannels.set(channelKey, channel)

  return () => {
    supabase.removeChannel(channel)
    activeChannels.delete(channelKey)
  }
}

/** Subscribe to multiple tables at once. Returns one cleanup fn. */
export function subscribeToTables(tables, userId, onUpdate) {
  if (!isSupabaseConfigured() || !userId) return () => {}
  const cleanups = tables.map(t => subscribeToTable(t, userId, (payload) => onUpdate(t, payload)))
  return () => cleanups.forEach(fn => fn())
}

/** Remove all active channels (call on sign-out) */
export function unsubscribeAll() {
  activeChannels.forEach(channel => supabase.removeChannel(channel))
  activeChannels.clear()
}
