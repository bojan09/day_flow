// Component: UserMenu
// Purpose: Avatar + dropdown at the bottom of the sidebar.
//          Sign-out is handled by useAuth.signOut() which redirects to /welcome.
//          Never navigates to '/' — that could trigger sign-out side-effects.
import { useState } from 'react'
import { useAuth }    from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { isSupabaseConfigured } from '../../services/supabaseClient'

export default function UserMenu({ onOpenSettings }) {
  const { user, signOut } = useAuth()
  const { displayName, initials } = useProfile(user?.id)
  const [open, setOpen] = useState(false)

  // Demo mode — show a neutral "Demo mode" pill instead
  if (!isSupabaseConfigured() || !user) {
    return (
      <div
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
        style={{ color: 'var(--text-faint)' }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)' }}
        >
          D
        </div>
        <span className="text-sm">Demo mode</span>
      </div>
    )
  }

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()  // signOut() handles navigation to /welcome
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="hover-surface flex items-center gap-2.5 px-2.5 py-2 rounded-xl w-full transition-all text-left"
        style={{ color: 'var(--text-muted)' }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {initials || '?'}
        </div>
        <span className="text-sm truncate flex-1">{displayName}</span>
        <span
          className="text-[10px] transition-transform duration-150"
          style={{ color: 'var(--text-faint)', transform: open ? 'rotate(180deg)' : 'none' }}
        >
          ▾
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="absolute bottom-full left-0 mb-1 w-52 rounded-2xl border py-1.5 z-50 animate-fade-up"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor:     'var(--border)',
              boxShadow:       'var(--shadow-modal)',
            }}
          >
            {/* User info */}
            <div
              className="px-4 py-2.5 border-b"
              style={{ borderColor: 'var(--border-soft)' }}
            >
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                {displayName}
              </p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-faint)' }}>
                {user.email}
              </p>
            </div>

            {/* Menu items */}
            {onOpenSettings && (
              <button
                onClick={() => { onOpenSettings(); setOpen(false) }}
                className="hover-surface flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>⚙️</span> Account settings
              </button>
            )}

            <div className="my-1 border-t" style={{ borderColor: 'var(--border-soft)' }} />

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="hover-danger flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left"
              style={{ color: '#ef4444' }}
            >
              <span>🚪</span> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
