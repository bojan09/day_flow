// Component: Modal
// Purpose: Viewport-centered dialog. Panel height is capped (85dvh where
//          supported, safe-area aware — see .modal-panel in index.css) with
//          internal scroll so buttons are always reachable regardless of
//          content height, mobile browser chrome, or notch/home-indicator insets.
//          No body style changes — page remains scrollable behind the overlay.
//          Portaled to document.body: PageTransition.jsx sets an inline
//          `transform` on the route wrapper for its page-enter animation, and
//          ANY transform on an ancestor creates a new containing block for
//          `position: fixed` descendants — without the portal, this modal's
//          "fixed inset-0" would resolve against that wrapper's box instead
//          of the real viewport, breaking full-viewport sizing/centering.
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE = 'input, textarea, select, button:not([aria-label="Close"]), [href], [tabindex]:not([tabindex="-1"])'
// Full focusable set (includes the Close button) — used for the Tab-cycle focus
// trap, where the close button must remain a normal stop in the tab order.
const FOCUSABLE_ALL = 'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])'

export default function Modal({ isOpen, onClose, title, children, fullScreenOnMobile = false }) {
  const panelRef    = useRef(null)
  const restoreRef  = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab') {
        const panel = panelRef.current
        if (!panel) return
        const focusables = Array.from(panel.querySelectorAll(FOCUSABLE_ALL))
          .filter(el => !el.disabled && el.tabIndex !== -1 && el.offsetParent !== null)
        if (focusables.length === 0) return
        const first = focusables[0]
        const last  = focusables[focusables.length - 1]
        const active = document.activeElement
        if (e.shiftKey) {
          if (active === first || !panel.contains(active)) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last || !panel.contains(active)) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Focus management: move focus into the panel on open, restore on close
  useEffect(() => {
    if (!isOpen) return
    restoreRef.current = document.activeElement
    const target = panelRef.current?.querySelector(FOCUSABLE) || panelRef.current
    target?.focus?.()
    return () => restoreRef.current?.focus?.()
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 animate-fade-in"
        style={{ backgroundColor: 'var(--overlay)', zIndex: 'var(--z-modal)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centering wrapper — fixed, does NOT scroll itself */}
      <div
        className={`fixed inset-0 flex items-center justify-center ${fullScreenOnMobile ? 'p-0 sm:p-4' : 'p-4'}`}
        style={{ zIndex: 'var(--z-modal)', pointerEvents: 'none' }}
      >
        {/* Panel — capped height (dvh/safe-area aware, see .modal-panel /
            .modal-panel-full), header pinned, body scrolls so buttons stay
            reachable. fullScreenOnMobile takes over the entire viewport on
            phones (no gaps/rounded corners), reverting to a normal capped
            centered dialog at sm and up. */}
        <div
          className={`${fullScreenOnMobile ? 'modal-panel-full rounded-none sm:rounded-2xl sm:max-w-lg' : 'modal-panel rounded-2xl sm:max-w-lg'} w-full flex flex-col animate-scale-in`}
          style={{
            backgroundColor: 'var(--surface)',
            boxShadow:       '0 8px 40px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)',
            pointerEvents:   'auto',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          ref={panelRef}
          tabIndex={-1}
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
              className="hover-surface tap-target w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ml-2 flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
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
    </>,
    document.body
  )
}
