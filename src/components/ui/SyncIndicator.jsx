// Component: SyncIndicator
// Purpose: TopBar sync status dot — shows connected/syncing/offline/error.
//          When queue > 0 shows pending count. Error state has a retry button.
import { useState } from 'react'
import { useOfflineQueueContext } from '../../hooks/useOfflineQueue'

const STATES = {
  offline:    { color: '#9CA3AF', label: 'Offline',         pulse: false },
  syncing:    { color: '#F59E0B', label: 'Syncing…',        pulse: true  },
  error:      { color: '#EF4444', label: 'Sync error',      pulse: false },
  pending:    { color: '#F59E0B', label: 'Pending sync',    pulse: true  },
  connected:  { color: '#3B6B4B', label: 'Synced',          pulse: false },
}

export default function SyncIndicator({ isConfigured }) {
  const offline   = useOfflineQueueContext()
  const [open,    setOpen]    = useState(false)

  if (!isConfigured) return null

  const { isOnline, queueLength, replaying, realtimeStatus } = offline || {}

  // Determine current state
  const currentState =
    !isOnline                       ? 'offline'   :
    replaying                       ? 'syncing'   :
    realtimeStatus === 'error'      ? 'error'     :
    (queueLength > 0)               ? 'pending'   :
    'connected'

  const cfg  = STATES[currentState]

  const handleRetry = () => {
    // Force page reload to re-establish Supabase real-time connection
    window.location.reload()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="tap-target flex items-center gap-1.5 transition-opacity hover:opacity-80 min-h-[44px]"
        aria-label={`Sync status: ${cfg.label}`}
      >
        {/* Dot */}
        <span className="relative flex h-2 w-2">
          {cfg.pulse && (
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: cfg.color }}
            />
          )}
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: cfg.color }}
          />
        </span>

        {/* Label */}
        <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-faint)' }}>
          {cfg.label}
        </span>

        {/* Pending count badge */}
        {queueLength > 0 && isOnline && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none"
            style={{ backgroundColor: '#F59E0B' }}
          >
            {queueLength}
          </span>
        )}
      </button>

      {/* Dropdown detail panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-8 z-50 w-64 rounded-2xl border py-3 shadow-lg"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor:     'var(--border)',
              boxShadow:       'var(--shadow-modal)',
            }}
          >
            {/* Header */}
            <div className="px-4 pb-2 border-b" style={{ borderColor: 'var(--border-soft)' }}>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {cfg.label}
                </p>
              </div>
            </div>

            {/* Detail rows */}
            <div className="px-4 py-2 space-y-2">
              {/* Online status */}
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Connection</span>
                <span
                  className="font-medium"
                  style={{ color: isOnline ? '#10B981' : '#EF4444' }}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Queue count */}
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Pending writes</span>
                <span className="font-medium" style={{ color: queueLength > 0 ? '#F59E0B' : '#10B981' }}>
                  {queueLength > 0 ? `${queueLength} queued` : 'All synced'}
                </span>
              </div>

              {/* Realtime status */}
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Real-time</span>
                <span
                  className="font-medium"
                  style={{ color: realtimeStatus === 'connected' ? '#10B981' : 'var(--text-faint)' }}
                >
                  {realtimeStatus === 'connected' ? 'Connected'
                    : realtimeStatus === 'error'   ? 'Error'
                    : 'Connecting…'}
                </span>
              </div>
            </div>

            {/* Actions */}
            {(realtimeStatus === 'error' || !isOnline === false && queueLength > 0) && (
              <div className="px-4 pt-2 border-t" style={{ borderColor: 'var(--border-soft)' }}>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  ↻ Reconnect now
                </button>
              </div>
            )}

            {/* Offline explanation */}
            {!isOnline && (
              <div className="px-4 pt-2 border-t" style={{ borderColor: 'var(--border-soft)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                  You're offline. All changes are saved locally and will sync automatically when your connection returns.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
