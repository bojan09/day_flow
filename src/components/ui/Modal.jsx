// Component: Modal
// Purpose: Viewport-centered dialog. Panel is max 85vh tall with internal scroll
//          so buttons are always reachable regardless of content height.
//          No body style changes — page remains scrollable behind the overlay.
import { useId, useRef } from 'react'
import { useDialogA11y } from '../../hooks/useDialogA11y'

const FOCUSABLE = 'input, textarea, select, button:not([aria-label="Close"]), [href], [tabindex]:not([tabindex="-1"])'
// Full focusable set (includes the Close button) — used for the Tab-cycle focus
// trap, where the close button must remain a normal stop in the tab order.
const FOCUSABLE_ALL = 'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])'

export default function Modal({ isOpen, onClose, title, children }) {
  const panelRef    = useRef(null)
  const titleId=useId();useDialogA11y({open:isOpen,onClose,panelRef})

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
          aria-labelledby={titleId}
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
              id={titleId}
              className="font-serif text-lg"
              style={{ color: 'var(--text)' }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="hover-surface w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors ml-2 flex-shrink-0"
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
    </>
  )
}
