// Component: Modal
// Purpose: Accessible theme-aware overlay — slides up on mobile, centered on desktop
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
        style={{ background: 'var(--overlay)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-scale-in"
        style={{
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
          style={{ borderColor: 'var(--border-soft)', backgroundColor: 'var(--surface)' }}
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
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
