// Component: CollapsibleWidget
// Purpose: Collapsible section header for Today widgets.
//          State persisted via usePersistedState (Supabase KV) — no localStorage.
import { useState } from 'react'

export default function CollapsibleWidget({
  id, title, emoji, defaultOpen = true, children,
  isPinned = false, onTogglePin, onToggleHide,
}) {
  // Use simple local state for open/close — it's a pure UI preference
  // that resets to defaultOpen each session (intentional UX)
  const [open,     setOpen]     = useState(defaultOpen)
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 mb-1 rounded-xl transition-colors group"
        style={{ color: 'var(--text-muted)' }}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 flex-1 text-left min-h-[36px]"
          aria-expanded={open}
        >
          <span className="text-sm">{emoji}</span>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: isPinned ? 'var(--accent-text)' : 'var(--text-faint)' }}
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

        {/* ⋯ menu */}
        {(onTogglePin || onToggleHide) && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v) }}
              className="hover-surface w-7 h-7 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              style={{ color: 'var(--text-faint)' }}
            >⋯</button>

            {showMenu && (
              <div
                className="absolute right-0 top-8 z-20 rounded-2xl border py-1.5 min-w-[160px] shadow-lg"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-modal)' }}
                onClick={e => e.stopPropagation()}
                onMouseLeave={() => setShowMenu(false)}
              >
                {onTogglePin && (
                  <button
                    onClick={() => { onTogglePin(id); setShowMenu(false) }}
                    className="hover-surface w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{ color: isPinned ? 'var(--accent-text)' : 'var(--text-muted)' }}
                  >
                    <span>{isPinned ? '📌' : '📍'}</span>
                    {isPinned ? 'Unpin from top' : 'Pin to top'}
                  </button>
                )}
                {onToggleHide && (
                  <button
                    onClick={() => { onToggleHide(id); setShowMenu(false) }}
                    className="hover-danger w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{ color: 'var(--text-muted)' }}
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
