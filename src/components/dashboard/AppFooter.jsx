// Component: AppFooter
// Purpose: Minimal app footer shown to authenticated users inside the dashboard.
//          Contains: version, keyboard shortcut hint, export link, sign-out.
//          Deliberately sparse — keeps focus on the app content above.
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../services/supabaseClient'

const VERSION = '3.0.0'

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
      <span>
        DayFlow{' '}
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-medium"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-faint)' }}
        >
          v{VERSION}
        </span>
      </span>

      {/* Centre — quick links */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => onTabChange?.('search')}
          className="transition-colors hover:underline underline-offset-2"
          style={{ color: 'var(--text-faint)' }}
          onMouseOver={e => e.target.style.color = 'var(--text-muted)'}
          onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
        >
          Search
        </button>
        <button
          onClick={() => onTabChange?.('insights')}
          className="transition-colors hover:underline underline-offset-2"
          style={{ color: 'var(--text-faint)' }}
          onMouseOver={e => e.target.style.color = 'var(--text-muted)'}
          onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
        >
          Insights
        </button>
        <button
          onClick={() => onTabChange?.('insights')}
          className="transition-colors hover:underline underline-offset-2"
          style={{ color: 'var(--text-faint)' }}
          onMouseOver={e => e.target.style.color = 'var(--text-muted)'}
          onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
        >
          Export data
        </button>
        <span
          className="px-2 py-0.5 rounded border text-[10px]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
          title="Press ? to see all shortcuts"
        >
          Press ? for shortcuts
        </span>
      </div>

      {/* Right — sign out (only when Supabase is configured and user is logged in) */}
      <div className="flex items-center gap-4">
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
      </div>
    </footer>
  )
}
