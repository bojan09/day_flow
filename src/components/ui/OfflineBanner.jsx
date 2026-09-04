// Component: OfflineBanner
// Purpose: Inline banner rendered inside the layout column — no fixed positioning.
//          Shows offline state, queue count, replay progress, and sync confirmation.
import { useState, useEffect } from 'react'

export default function OfflineBanner({ isOnline, queueLength, replaying }) {
  const [visible,    setVisible]    = useState(false)
  const [showSynced, setShowSynced] = useState(false)
  const [dismissed,  setDismissed]  = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setVisible(true)
      setShowSynced(false)
      setDismissed(false)
    } else if (visible && !dismissed) {
      if (replaying) {
        // Keep showing while replaying
        setShowSynced(false)
      } else if (queueLength === 0) {
        // All synced — show confirmation briefly
        setShowSynced(true)
        const t = setTimeout(() => {
          setVisible(false)
          setShowSynced(false)
        }, 2500)
        return () => clearTimeout(t)
      }
    }
  // Driven by the online/offline transition only; depending on the banner
  // state it sets would immediately retrigger it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, queueLength, replaying])

  // Also show when online but queue > 0 (pending writes from previous session)
  const showPendingOnline = isOnline && !replaying && queueLength > 0 && !showSynced

  if (!visible && !showPendingOnline) return null

  const config = showSynced
    ? { bg: 'var(--accent-light)', border: 'var(--accent-mid)', text: 'var(--accent)',
        icon: '✓', msg: 'Back online — all changes synced' }
    : replaying
    ? { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E',
        icon: '↻', msg: `Syncing ${queueLength} pending change${queueLength !== 1 ? 's' : ''}…` }
    : showPendingOnline
    ? { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E',
        icon: '⏳', msg: `${queueLength} change${queueLength !== 1 ? 's' : ''} pending sync` }
    : { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B',
        icon: '⚡', msg: `You're offline — changes are saved locally` }

  return (
    <div
      className="flex items-center justify-between gap-2 px-4 sm:px-6 md:px-8 py-2
                 text-xs font-medium animate-fade-down"
      style={{
        backgroundColor: config.bg,
        borderBottom:    `1px solid ${config.border}`,
        color:           config.text,
        flexShrink:      0,
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span
          className={replaying ? 'animate-spin inline-block' : 'inline-block'}
          aria-hidden="true"
        >
          {config.icon}
        </span>
        <span>{config.msg}</span>

        {/* Queue count badge when offline */}
        {!isOnline && queueLength > 0 && (
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: '#991B1B' }}
          >
            {queueLength}
          </span>
        )}
      </div>

      {/* Dismiss button — only for non-critical states */}
      {(showSynced || showPendingOnline) && (
        <button
          type="button"
          onClick={() => { setVisible(false); setDismissed(true) }}
          className="flex-shrink-0 text-xs opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
          style={{ color: config.text }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
