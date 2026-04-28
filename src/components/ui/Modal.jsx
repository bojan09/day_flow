// Component: Modal
// Purpose: Floating dialog — no body scroll lock, no overflow restrictions.
//          Page remains fully scrollable while modal is open.
//          Modal content is fully visible and internally scrollable.
//
// Design:
//   - position:fixed overlay — does NOT touch document.body at all
//   - Outer wrapper uses flex centering so modal is always in view
//   - Panel has no max-height restriction — grows with content
//   - If content is taller than viewport, the OVERLAY itself scrolls
//     so all content stays reachable without locking the page
import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  // Close on Escape key — no body style changes ever
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop — fixed, covers viewport, click to close */}
      <div
        className="fixed inset-0 animate-fade-in"
        style={{
          backgroundColor: 'var(--overlay)',
          zIndex: 9998,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Scroll container — fixed, full viewport, scrollable */}
      {/* This lets modal content taller than screen remain reachable */}
      <div
        className="fixed inset-0 flex items-start justify-center sm:items-center p-4 sm:p-6"
        style={{
          zIndex:    9999,
          overflowY: 'auto',  // the CONTAINER scrolls, not the page, not the modal
        }}
        onClick={onClose}
      >
        {/* Panel — no max-height, grows naturally */}
        <div
          className="
            relative w-full rounded-2xl my-auto
            sm:max-w-lg
            animate-scale-in
          "
          style={{
            backgroundColor: 'var(--surface)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)',
            // No max-height — never clips content
            // No overflow — never hides content
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
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
              className="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ml-2 flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body — no restrictions */}
          <div className="p-5">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
