// Component: SyncIndicator
// Purpose: Shows real-time connection status — hidden entirely when Supabase is not configured
import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient'

export default function SyncIndicator() {
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    // Only attempt connection if Supabase is actually configured
    if (!isSupabaseConfigured()) return

    setStatus('connecting')

    let channel
    try {
      channel = supabase
        .channel('__presence__')
        .subscribe((state) => {
          if      (state === 'SUBSCRIBED')    setStatus('connected')
          else if (state === 'CLOSED')        setStatus('error')
          else if (state === 'CHANNEL_ERROR') setStatus('error')
          else                                setStatus('connecting')
        })
    } catch {
      setStatus('error')
    }

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  // Don't render anything in demo mode
  if (!isSupabaseConfigured()) return null
  if (status === 'idle')       return null

  const CONFIG = {
    connected:  { color: '#3B6B4B', label: 'Synced',   pulse: false },
    connecting: { color: '#F59E0B', label: 'Syncing…', pulse: true  },
    error:      { color: '#EF4444', label: 'Offline',  pulse: false },
  }

  const c = CONFIG[status]
  if (!c) return null

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium"
      style={{ color: c.color }}
      title={`Sync: ${status}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: c.color }}
      />
      <span className="hidden sm:inline">{c.label}</span>
    </div>
  )
}
