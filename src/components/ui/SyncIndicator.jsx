// Component: SyncIndicator
// Purpose: Combined connection + sync status in the TopBar.
//          Shows realtime Supabase state AND offline queue state.
//          Hidden entirely in demo mode (no Supabase configured).
import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient'
import { useOfflineQueueContext } from '../../hooks/useOfflineQueue'

export default function SyncIndicator() {
  const [realtimeStatus, setRealtimeStatus] = useState('idle')
  const offline = useOfflineQueueContext() || { isOnline: true, queueLength: 0, replaying: false }

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    setRealtimeStatus('connecting')
    let channel
    try {
      channel = supabase
        .channel('__presence__')
        .subscribe(state => {
          if      (state === 'SUBSCRIBED')    setRealtimeStatus('connected')
          else if (state === 'CLOSED')        setRealtimeStatus('error')
          else if (state === 'CHANNEL_ERROR') setRealtimeStatus('error')
          else                                setRealtimeStatus('connecting')
        })
    } catch {
      setRealtimeStatus('error')
    }
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [])

  if (!isSupabaseConfigured()) return null

  // Offline takes priority
  if (!offline.isOnline) {
    return (
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium"
        style={{ color: '#EF4444' }}
        title={`Offline — ${offline.queueLength} change${offline.queueLength !== 1 ? 's' : ''} queued`}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#EF4444' }} />
        <span className="hidden sm:inline">
          Offline{offline.queueLength > 0 ? ` (${offline.queueLength})` : ''}
        </span>
      </div>
    )
  }

  // Replaying queue
  if (offline.replaying) {
    return (
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium"
        style={{ color: '#F59E0B' }}
        title={`Syncing ${offline.queueLength} queued change${offline.queueLength !== 1 ? 's' : ''}…`}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: '#F59E0B' }} />
        <span className="hidden sm:inline">Syncing…</span>
      </div>
    )
  }

  // Realtime channel status
  const CONFIG = {
    connected:  { color: '#3B6B4B', label: 'Synced',      pulse: false },
    connecting: { color: '#F59E0B', label: 'Connecting…', pulse: true  },
    error:      { color: '#EF4444', label: 'Sync error',  pulse: false },
    idle:       { color: '#F59E0B', label: 'Connecting…', pulse: true  },
  }
  const c = CONFIG[realtimeStatus]

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium"
      style={{ color: c.color }}
      title={`Status: ${realtimeStatus}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: c.color }}
      />
      <span className="hidden sm:inline">{c.label}</span>
    </div>
  )
}
