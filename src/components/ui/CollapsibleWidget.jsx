// Component: CollapsibleWidget
// Purpose: Adds a tap-to-collapse header to any Today widget.
//          Does NOT add its own card — each child provides its own surface.
//          Collapsed state persists in localStorage across navigation.
import { useState, useEffect } from 'react'

export default function CollapsibleWidget({ id, title, emoji, defaultOpen = true, children }) {
  const storageKey = `dayflow_widget_${id}`

  const [open, setOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved !== null ? JSON.parse(saved) : defaultOpen
    } catch { return defaultOpen }
  })

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(open)) } catch {}
  }, [open, storageKey])

  return (
    <div>
      {/* Clickable header strip — styled as a light pill */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2 mb-1 rounded-xl transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{emoji}</span>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            {title}
          </span>
        </div>
        <span
          className="text-[10px] transition-transform duration-200"
          style={{ color: 'var(--text-faint)', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >▼</span>
      </button>

      {/* Content — visible when open */}
      {open && children}
    </div>
  )
}
