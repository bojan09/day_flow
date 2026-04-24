// Component: CollapsibleWidget
// Purpose: Collapse header for Today widgets. Supports pin-to-top and hide.
//          Long-tap or ⋯ menu reveals widget controls on mobile.
import { useState, useEffect } from 'react'

export default function CollapsibleWidget({
  id, title, emoji, defaultOpen = true, children,
  isPinned = false, isHidden = false,
  onTogglePin, onToggleHide,
}) {
  const storageKey = `dayflow_widget_${id}`
  const [open,    setOpen]    = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved !== null ? JSON.parse(saved) : defaultOpen
    } catch { return defaultOpen }
  })
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(open)) } catch {}
  }, [open, storageKey])

  // Close menu when clicking elsewhere
  useEffect(() => {
    if (!showMenu) return
    const close = () => setShowMenu(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [showMenu])

  return (
    <div className="relative">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 mb-1 rounded-xl transition-colors group"
        style={{ color: 'var(--text-muted)' }}
      >
        {/* Left — collapse toggle (most of the row is tappable) */}
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 flex-1 text-left min-h-[36px]"
          aria-expanded={open}
        >
          <span className="text-sm">{emoji}</span>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: isPinned ? 'var(--accent)' : 'var(--text-faint)' }}
          >
            {title}
            {isPinned && <span className="ml-1.5 text-[9px]">📌</span>}
          </span>
          <span
            className="text-[10px] ml-1 transition-transform duration-200"
            style={{
              color:           'var(--text-faint)',
              display:         'inline-block',
              transform:       open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >▼</span>
        </button>

        {/* Right — ⋯ menu (visible on hover/focus) */}
        {(onTogglePin || onToggleHide) && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v) }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              style={{ color: 'var(--text-faint)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Widget options"
            >⋯</button>

            {showMenu && (
              <div
                className="absolute right-0 top-8 z-20 rounded-2xl border py-1.5 min-w-[160px] shadow-lg"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-modal)' }}
                onClick={e => e.stopPropagation()}
              >
                {onTogglePin && (
                  <button
                    onClick={() => { onTogglePin(id); setShowMenu(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{ color: isPinned ? 'var(--accent)' : 'var(--text-muted)' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span>{isPinned ? '📌' : '📍'}</span>
                    {isPinned ? 'Unpin from top' : 'Pin to top'}
                  </button>
                )}
                {onToggleHide && (
                  <button
                    onClick={() => { onToggleHide(id); setShowMenu(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = '#fef2f2'
                      e.currentTarget.style.color = '#ef4444'
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--text-muted)'
                    }}
                  >
                    <span>🙈</span>
                    Hide this widget
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {open && children}
    </div>
  )
}
