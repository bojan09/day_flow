// Component: OfflineBanner
// Purpose: Shows a slim banner when offline — auto-dismisses when reconnected.
//          Shows queue replay progress when syncing pending writes.
import { useState, useEffect } from 'react'

export default function OfflineBanner({ isOnline, queueLength, replaying }) {
  const [visible,   setVisible]   = useState(false)
  const [showSynced, setShowSynced] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setVisible(true)
      setShowSynced(false)
    } else if (visible) {
      // Was offline, now back — show "synced" briefly
      if (queueLength === 0 && !replaying) {
        setShowSynced(true)
        const t = setTimeout(() => { setVisible(false); setShowSynced(false) }, 2500)
        return () => clearTimeout(t)
      }
    }
  }, [isOnline, visible, queueLength, replaying])

  if (!visible) return null

  const config = showSynced
    ? { bg: 'var(--accent-light)', border: 'var(--accent-mid)', color: 'var(--accent)',    icon: '✓', text: 'Back online — all changes synced' }
    : replaying
    ? { bg: '#FFFBEB',             border: '#FDE68A',            color: '#92400E',          icon: '↻', text: `Syncing ${queueLength} change${queueLength !== 1 ? 's' : ''}…` }
    : { bg: '#FEF2F2',             border: '#FECACA',            color: '#991B1B',          icon: '⚡', text: `You're offline — changes saved locally` }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[70] flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium transition-all animate-fade-down"
      style={{
        backgroundColor: config.bg,
        borderBottom:    `1px solid ${config.border}`,
        color:           config.color,
      }}
      role="status"
      aria-live="polite"
    >
      <span
        className={replaying ? 'animate-spin inline-block' : ''}
        style={{ display: 'inline-block' }}
      >
        {config.icon}
      </span>
      <span>{config.text}</span>
      {!isOnline && queueLength > 0 && (
        <span
          className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
          style={{ backgroundColor: '#991B1B', color: 'white' }}
        >
          {queueLength}
        </span>
      )}
    </div>
  )
}
