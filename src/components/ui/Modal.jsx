// Component: Modal
// Purpose: Viewport-centered dialog. Panel is max 85vh tall with internal scroll
//          so buttons are always reachable regardless of content height.
//          No body style changes — page remains scrollable behind the overlay.
import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 animate-fade-in"
        style={{ backgroundColor: 'var(--overlay)', zIndex: 9998 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering wrapper — fixed, does NOT scroll itself */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 9999, pointerEvents: 'none' }}
      >
        {/* Panel — max 85vh, header pinned, body scrolls */}
        <div
          className="w-full sm:max-w-lg rounded-2xl flex flex-col animate-scale-in"
          style={{
            backgroundColor: 'var(--surface)',
            boxShadow:       '0 8px 40px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)',
            maxHeight:       '85vh',       // never taller than viewport
            pointerEvents:   'auto',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={e => e.stopPropagation()}
        >
          {/* Header — always visible, never scrolls */}
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
              className="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ml-2 flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body — this is the ONLY thing that scrolls */}
          <div
            className="p-5 overflow-y-auto flex-1"
            style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
