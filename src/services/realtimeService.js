// Service: realtimeService
// Purpose: Supabase real-time channel subscriptions — fully guarded for demo mode
import { supabase, isSupabaseConfigured } from './supabaseClient'

const activeChannels = new Map()

export function subscribeToTable(table, userId, onUpdate) {
  // Silently no-op in demo mode — no crash, no warning spam
  if (!isSupabaseConfigured() || !userId || !supabase) return () => {}

  const channelKey = `${table}:${userId}`

  if (activeChannels.has(channelKey)) {
    try { supabase.removeChannel(activeChannels.get(channelKey)) } catch {}
    activeChannels.delete(channelKey)
  }

  let channel
  try {
    channel = supabase
      .channel(channelKey)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` },
        (payload) => { try { onUpdate(payload) } catch {} }
      )
      .subscribe()

    activeChannels.set(channelKey, channel)
  } catch (err) {
    console.warn('[DayFlow] Realtime subscription failed:', err.message)
  }

  return () => {
    if (channel) { try { supabase.removeChannel(channel) } catch {} }
    activeChannels.delete(channelKey)
  }
}

export function subscribeToTables(tables, userId, onUpdate) {
  if (!isSupabaseConfigured() || !userId) return () => {}
  const cleanups = tables.map(t =>
    subscribeToTable(t, userId, (payload) => { try { onUpdate(t, payload) } catch {} })
  )
  return () => cleanups.forEach(fn => fn())
}

export function unsubscribeAll() {
  if (!supabase) return
  activeChannels.forEach(channel => { try { supabase.removeChannel(channel) } catch {} })
  activeChannels.clear()
}
