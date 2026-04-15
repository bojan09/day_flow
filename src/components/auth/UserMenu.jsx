// Component: UserMenu
// Purpose: Avatar + dropdown with profile, theme, and sign-out in the sidebar footer
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { isSupabaseConfigured } from '../../services/supabaseClient'

export default function UserMenu({ onOpenSettings }) {
  const { user, signOut } = useAuth()
  const { displayName, initials } = useProfile(user?.id)
  const [open, setOpen] = useState(false)

  // Demo mode — no auth
  if (!isSupabaseConfigured() || !user) {
    return (
      <div
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
        style={{ color: 'var(--text-faint)' }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          D
        </div>
        <span className="text-sm">Demo mode</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl w-full transition-all"
        style={{ color: 'var(--text-muted)' }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          {initials || '?'}
        </div>
        <span className="text-sm truncate flex-1 text-left">{displayName}</span>
        <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>▾</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div
            className="absolute bottom-full left-0 mb-1 w-52 rounded-2xl border py-1 z-50 animate-fade-up"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-modal)' }}
          >
            <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-soft)' }}>
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{displayName}</p>
              <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-faint)' }}>{user.email}</p>
            </div>

            {[
              { label: 'Account settings', icon: '⚙️', action: onOpenSettings },
            ].map(item => (
              <button key={item.label}
                onClick={() => { item.action?.(); setOpen(false) }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left"
                style={{ color: 'var(--text-muted)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span>{item.icon}</span>{item.label}
              </button>
            ))}

            <div className="border-t mt-1" style={{ borderColor: 'var(--border-soft)' }} />
            <button
              onClick={() => { signOut(); setOpen(false) }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left"
              style={{ color: '#ef4444' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>🚪</span> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
