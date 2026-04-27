// Component: Modal
// Purpose: Viewport-centered overlay — correct on all screen sizes and scroll positions.
//
// Mobile  (<640px): sheet slides up from bottom, flat bottom edge
// Desktop (≥640px): dialog centered in viewport, fully rounded, scale-in animation
//
// Scroll lock: uses overflow:hidden only (NOT position:fixed) — avoids iOS Safari
//              scroll-to-top bug that affected the previous implementation.
// Height:  max-height:90vh + flex-column ensures header is always visible and
//          only the body scrolls — content is never clipped.

import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 animate-fade-in"
        style={{ backgroundColor: 'var(--overlay)', zIndex: 9998 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Outer positioner — different alignment per breakpoint ─────────── */}
      {/*   Mobile  (default): fixed bottom-0, full width → sheet slides up    */}
      {/*   Desktop (sm+):     fixed inset-0, flex center → dialog appears     */}
      <div
        className="
          fixed bottom-0 left-0 right-0
          sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4
        "
        style={{ zIndex: 9999, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        {/* ── Panel ──────────────────────────────────────────────────────── */}
        <div
          className="
            animate-slide-up
            w-full
            rounded-t-3xl
            sm:rounded-2xl sm:max-w-lg sm:w-full
          "
          style={{
            backgroundColor: 'var(--surface)',
            boxShadow:       '0 -8px 40px rgba(0,0,0,0.15), 0 2px 12px rgba(0,0,0,0.08)',
            maxHeight:       '90vh',
            display:         'flex',
            flexDirection:   'column',
            pointerEvents:   'auto',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle — mobile only */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
          </div>

          {/* Header — pinned, never scrolls */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            <h3
              id="modal-title"
              className="font-serif text-lg"
              style={{ color: 'var(--text)' }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors flex-shrink-0 ml-2"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body — only this scrolls */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden p-5"
            style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
