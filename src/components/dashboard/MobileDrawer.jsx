// Component: MobileDrawer
// Purpose: Mobile slide-up navigation sheet — full nav parity with desktop sidebar.
//          Opens via "More" button. Swipe down or tap backdrop to close.
//          Phases 4.0.3, 4.0.4, 4.0.5, 4.0.6.
import { useEffect, useRef, useState } from 'react'
import { useAuth }    from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import ThemeToggle    from '../ui/ThemeToggle'
import { isSupabaseConfigured } from '../../services/supabaseClient'

// Same focusable-element query Modal.jsx uses for its initial-focus target.
const FOCUSABLE = 'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])'

import { PRIMARY_TABS, MORE_TABS } from '../../config/navigation'

const PRIMARY_SECTION = { label: 'Primary', tabs: PRIMARY_TABS }
const MORE_SECTION    = { label: 'More',    tabs: MORE_TABS }

// ── User profile strip ────────────────────────────────────────────────────────
function DrawerProfile({ onSignOut }) {
  const { user } = useAuth()
  const { displayName, initials } = useProfile(user?.id)

  if (!isSupabaseConfigured() || !user) {
    return (
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ backgroundColor: 'var(--accent)' }}
        >D</div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Demo mode</p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Sign in to sync data</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 px-5 py-4 border-b"
      style={{ borderColor: 'var(--border-soft)' }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {initials || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
          {displayName}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>
          {user.email}
        </p>
      </div>
      <button
        onClick={onSignOut}
        className="hover-danger flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors"
        style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
      >
        Sign out
      </button>
    </div>
  )
}

// ── Main drawer ───────────────────────────────────────────────────────────────
export default function MobileDrawer({
  isOpen, onClose, activeTab, onTabChange,
  theme, onSetTheme,
}) {
  const { signOut }  = useAuth()
  const sheetRef     = useRef(null)
  const restoreRef   = useRef(null)
  const dragStartY   = useRef(null)
  const dragCurrentY = useRef(0)
  // "More" starts collapsed unless the active tab already lives there, so a
  // deep-link or refresh into e.g. Calendar doesn't hide the current tab.
  const [moreOpen, setMoreOpen] = useState(() => MORE_SECTION.tabs.some(t => t.id === activeTab))

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape-to-close — same pattern as Modal.jsx
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Focus management: move focus into the sheet on open, restore on close —
  // same pattern as Modal.jsx
  useEffect(() => {
    if (!isOpen) return
    restoreRef.current = document.activeElement
    const target = sheetRef.current?.querySelector(FOCUSABLE) || sheetRef.current
    target?.focus?.()
    return () => restoreRef.current?.focus?.()
  }, [isOpen])

  // ── Swipe-to-close (Phase 4.0.6) ──────────────────────────────────────────
  const onTouchStart = (e) => {
    dragStartY.current   = e.touches[0].clientY
    dragCurrentY.current = 0
    if (sheetRef.current) sheetRef.current.style.transition = 'none'
  }

  const onTouchMove = (e) => {
    if (dragStartY.current === null) return
    const dy = e.touches[0].clientY - dragStartY.current
    if (dy < 0) return // don't allow dragging up
    dragCurrentY.current = dy
    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${dy}px)`
    }
  }

  const onTouchEnd = () => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = ''
      sheetRef.current.style.transform  = ''
    }
    if (dragCurrentY.current > 120) onClose()
    dragStartY.current   = null
    dragCurrentY.current = 0
  }

  const handleTabSelect = (id) => {
    onTabChange(id)
    onClose()
  }

  const handleSignOut = async () => {
    onClose()
    await signOut()
  }

  if (!isOpen) return null

  return (
    <div className="md:hidden fixed inset-0 z-[var(--z-drawer)]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ backgroundColor: 'var(--overlay)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 flex flex-col rounded-t-3xl animate-slide-up"
        style={{
          backgroundColor: 'var(--surface)',
          maxHeight:        '88vh',
          boxShadow:        '0 -8px 40px rgba(0,0,0,0.15)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        tabIndex={-1}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--border)' }}
          />
        </div>

        {/* User profile */}
        <DrawerProfile onSignOut={handleSignOut} />

        {/* Scrollable nav */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {/* Primary — always visible */}
          <div className="mb-5">
            <div className="grid grid-cols-2 gap-1.5">
              {PRIMARY_SECTION.tabs.map(t => {
                const active = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTabSelect(t.id)}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-2xl text-sm font-medium transition-all active:scale-95 text-left"
                    style={active
                      ? { backgroundColor: 'var(--accent)', color: 'white' }
                      : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }
                    }
                  >
                    <t.Icon size={17} strokeWidth={2} className="flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium truncate">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* More — collapsed by default, de-emphasized when open */}
          <button
            onClick={() => setMoreOpen(o => !o)}
            className="flex items-center gap-1.5 px-2 py-1.5 mb-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-faint)' }}
            aria-expanded={moreOpen}
          >
            <span>{moreOpen ? '▾' : '▸'}</span>
            More
          </button>
          {moreOpen && (
            <div className="grid grid-cols-2 gap-1.5">
              {MORE_SECTION.tabs.map(t => {
                const active = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTabSelect(t.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-medium transition-all active:scale-95 text-left"
                    style={active
                      ? { backgroundColor: 'var(--accent)', color: 'white' }
                      : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-faint)' }
                    }
                  >
                    <t.Icon size={15} strokeWidth={2} className="flex-shrink-0" aria-hidden="true" />
                    <span className="text-xs font-medium truncate">{t.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Appearance + safe-area footer */}
        <div
          className="flex-shrink-0 border-t px-5 py-4 pb-safe"
          style={{ borderColor: 'var(--border-soft)' }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-faint)' }}
          >
            Appearance
          </p>
          <ThemeToggle theme={theme} onSetTheme={onSetTheme} compact={false} />
        </div>
      </div>
    </div>
  )
}
