// Component: SyncIndicator
// Purpose: Small status dot in the TopBar showing real-time connection state
import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient'

export default function SyncIndicator() {
  const [status, setStatus] = useState('idle') // 'idle' | 'connected' | 'connecting' | 'error'

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    setStatus('connecting')

    // Monitor the Supabase realtime connection
    const channel = supabase.channel('__presence__')
      .subscribe((state) => {
        if (state === 'SUBSCRIBED')    setStatus('connected')
        else if (state === 'CLOSED')   setStatus('error')
        else if (state === 'CHANNEL_ERROR') setStatus('error')
        else                           setStatus('connecting')
      })

    return () => supabase.removeChannel(channel)
  }, [])

  if (!isSupabaseConfigured()) return null

  const CONFIG = {
    connected:  { color: '#3B6B4B', label: 'Synced',     pulse: false },
    connecting: { color: '#F59E0B', label: 'Syncing…',   pulse: true  },
    error:      { color: '#EF4444', label: 'Offline',    pulse: false },
    idle:       { color: '#A8A29E', label: '',           pulse: false  },
  }

  const c = CONFIG[status] || CONFIG.idle

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium"
      style={{ color: c.color }}
      title={`Sync status: ${status}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: c.color }}
      />
      {c.label && <span className="hidden sm:inline">{c.label}</span>}
    </div>
  )
}
