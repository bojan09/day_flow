// Component: AppFooter
// Purpose: Minimal logged-in footer — desktop only.
//          Sign-out centralised in useAuth.signOut() which redirects to /welcome.
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../services/supabaseClient'

const VERSION = '3.1.0'

export default function AppFooter({ onTabChange }) {
  const { signOut, user } = useAuth()

  return (
    <footer
      className="hidden md:flex items-center justify-between px-8 py-3 border-t text-xs flex-shrink-0"
      style={{
        borderColor:     'var(--border-soft)',
        color:           'var(--text-faint)',
        backgroundColor: 'var(--bg)',
      }}
    >
      {/* Left — brand + version */}
      <span className="flex items-center gap-2">
        <span style={{ color: 'var(--text-faint)' }}>DayFlow</span>
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-medium border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor:     'var(--border)',
            color:           'var(--text-faint)',
          }}
        >
          v{VERSION}
        </span>
      </span>

      {/* Centre — quick nav + shortcut hint */}
      <div className="flex items-center gap-5">
        {[
          { label: 'Search',    tab: 'search'   },
          { label: 'Insights',  tab: 'insights' },
          { label: 'Export',    tab: 'insights' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => onTabChange?.(item.tab)}
            className="transition-colors"
            style={{ color: 'var(--text-faint)' }}
            onMouseOver={e => e.target.style.color = 'var(--text-muted)'}
            onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
          >
            {item.label}
          </button>
        ))}
        <span
          className="px-2 py-0.5 rounded border text-[10px]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
          title="Press ? to see all shortcuts"
        >
          ? shortcuts
        </span>
      </div>

      {/* Right — sign out or demo indicator */}
      {isSupabaseConfigured() && user ? (
        <button
          onClick={signOut}
          className="transition-colors"
          style={{ color: 'var(--text-faint)' }}
          onMouseOver={e => e.target.style.color = '#ef4444'}
          onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
        >
          Sign out
        </button>
      ) : (
        <span style={{ color: 'var(--text-faint)' }}>Demo mode</span>
      )}
    </footer>
  )
}
