// Component: AppFooter
// Purpose: Minimal compact footer — desktop only, content-driven height, low z-index.
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../services/supabaseClient'

const VERSION = '5.0.0'

export default function AppFooter() {
  const { signOut, user } = useAuth()

  return (
    <footer
      className="hidden md:flex items-center justify-between px-6 py-1.5 border-t flex-shrink-0 text-[11px]"
      style={{
        borderColor:     'var(--border-soft)',
        color:           'var(--text-faint)',
        backgroundColor: 'var(--bg)',
        zIndex:          10,
      }}
    >
      <span>DayFlow v{VERSION}</span>
      {isSupabaseConfigured() && user ? (
        <button
          onClick={signOut}
          style={{ color: 'var(--text-faint)' }}
          onMouseOver={e => e.target.style.color = '#ef4444'}
          onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
        >
          Sign out
        </button>
      ) : (
        <span>Demo mode</span>
      )}
    </footer>
  )
}
