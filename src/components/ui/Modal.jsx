// Component: Modal
// Purpose: Theme-aware overlay. Header is sticky top, action footer is sticky bottom,
//          scrollable content in between — save button is always visible.
import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'var(--overlay)' }}
        onClick={onClose}
      />
      {/* Panel — flex column so header + footer are always visible */}
      <div
        className="relative w-full sm:max-w-md flex flex-col rounded-t-3xl sm:rounded-2xl animate-slide-up sm:animate-scale-in"
        style={{
          backgroundColor: 'var(--surface)',
          boxShadow:       'var(--shadow-modal)',
          maxHeight:       '92vh',
        }}
      >
        {/* Sticky header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border-soft)' }}
        >
          <h3 className="font-serif text-lg" style={{ color: 'var(--text)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
