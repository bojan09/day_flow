// Component: MobileDrawer
// Purpose: Mobile slide-up navigation sheet — full nav parity with desktop sidebar.
//          Opens via "More" button. Swipe down or tap backdrop to close.
//          Phases 4.0.3, 4.0.4, 4.0.5, 4.0.6.
import { useEffect, useRef } from 'react'
import { useAuth }    from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import ThemeToggle    from '../ui/ThemeToggle'
import { isSupabaseConfigured } from '../../services/supabaseClient'

const SECTIONS = [
  { label: 'Plan', tabs: [
    { id: 'today',     label: 'Today',     emoji: '☀️' },
    { id: 'tasks',     label: 'Tasks',     emoji: '✅' },
    { id: 'calendar',  label: 'Calendar',  emoji: '📅' },
    { id: 'timeblock', label: 'Schedule',  emoji: '⏰' },
    { id: 'projects',  label: 'Projects',  emoji: '🗂️' },
  ]},
  { label: 'Build', tabs: [
    { id: 'habits',     label: 'Habits',     emoji: '🔁' },
    { id: 'routines',   label: 'Routines',   emoji: '🌅' },
    { id: 'challenges', label: 'Challenges', emoji: '🎯' },
    { id: 'goals',      label: 'Goals',      emoji: '🏆' },
    { id: 'workouts',   label: 'Workouts',   emoji: '🏋️' },
  ]},
  { label: 'Think', tabs: [
    { id: 'notes',     label: 'Notes',      emoji: '📝' },
    { id: 'ideas',     label: 'Ideas',      emoji: '💡' },
    { id: 'braindump', label: 'Brain Dump', emoji: '🧠' },
    { id: 'bookmarks', label: 'Bookmarks',  emoji: '🔖' },
  ]},
  { label: 'Reflect', tabs: [
    { id: 'insights',     label: 'Insights',     emoji: '📊' },
    { id: 'balance',      label: 'Balance',       emoji: '⚖️' },
    { id: 'search',       label: 'Search',        emoji: '🔍' },
    { id: 'achievements', label: 'Achievements',  emoji: '🏅' },
  ]},
]

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
        className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors"
        style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
        onMouseOver={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca' }}
        onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.borderColor = 'var(--border)' }}
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
  const dragStartY   = useRef(null)
  const dragCurrentY = useRef(0)

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
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
    <div className="md:hidden fixed inset-0 z-[60]">
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
          {SECTIONS.map(section => (
            <div key={section.label} className="mb-5">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2"
                style={{ color: 'var(--text-faint)' }}
              >
                {section.label}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {section.tabs.map(t => {
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
                      <span className="text-base">{t.emoji}</span>
                      <span className="text-sm font-medium truncate">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
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
