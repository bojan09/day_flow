// Component: SideNav
// Purpose: Desktop sidebar — Primary + collapsible More nav, expanded theme
//          switcher, user menu. Logo always goes to /dashboard.
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import UserMenu    from '../auth/UserMenu'
import ThemeToggle from '../ui/ThemeToggle'
import Logo        from '../ui/Logo'

// Primary — always visible, the tabs used every day.
const PRIMARY_TABS = [
  { id: 'today',     label: 'Today',        emoji: '☀️' },
  { id: 'tasks',     label: 'DailyGoals',   emoji: '✅' },
  { id: 'rhythm',    label: 'Daily Rhythm', emoji: '🔁' },
  { id: 'workouts',  label: 'Workouts',     emoji: '🏋️' },
  { id: 'insights',  label: 'Insights',     emoji: '📊' },
  { id: 'capture',   label: 'Capture',      emoji: '📥' },
]

// More — secondary tabs, tucked behind a collapsed-by-default toggle.
const MORE_TABS = [
  { id: 'focus',     label: 'Focus',     emoji: '⏱️' },
  { id: 'calendar',  label: 'Calendar',  emoji: '📅' },
  { id: 'timeblock', label: 'Schedule',  emoji: '⏰' },
  { id: 'projects',  label: 'Projects',  emoji: '🗂️' },
  { id: 'search',    label: 'Search',    emoji: '🔍' },
]

// Preload lazy chunks when user hovers a nav item
const PRELOAD_MAP = {
  capture:    () => import('../capture/CaptureView'),
  insights:   () => import('../insights/InsightsView'),
  workouts:   () => import('../workouts/WorkoutsView'),
  calendar:   () => import('../calendar/CalendarView'),
  rhythm:     () => import('../rhythm/DailyRhythmView'),
  projects:   () => import('../projects/ProjectsView'),
  search:     () => import('../search/SearchView'),
}
const preload = (id) => PRELOAD_MAP[id]?.()

function NavButton({ t, active, onClick, small }) {
  return (
    <button
      key={t.id}
      onClick={onClick}
      onMouseEnter={() => preload(t.id)}
      className={`${active ? '' : 'hover-surface hover-text'} flex items-center gap-2.5 px-2.5 py-2 rounded-xl font-medium transition-all text-left ${small ? 'text-[13px]' : 'text-sm'}`}
      style={active
        ? {
            background:  'linear-gradient(90deg, var(--accent) 0%, var(--accent-mid) 100%)',
            color:       'white',
            boxShadow:   '0 2px 8px rgba(59,107,75,0.25)',
          }
        : { color: small ? 'var(--text-faint)' : 'var(--text-muted)' }
      }
    >
      <span className="text-sm w-4 text-center">{t.emoji}</span>
      {t.label}
    </button>
  )
}

export default function SideNav({ activeTab, onTabChange, theme, onSetTheme }) {
  const navigate = useNavigate()
  // "More" starts collapsed unless the active tab already lives there, so a
  // deep-link or refresh into e.g. Calendar doesn't hide the current tab.
  const [moreOpen, setMoreOpen] = useState(() => MORE_TABS.some(t => t.id === activeTab))

  return (
    <nav
      className="fixed top-0 left-0 h-screen w-60 flex flex-col py-5 px-3 z-40 overflow-y-auto scrollbar-hide border-r"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <button
        onClick={() => { navigate('/dashboard'); onTabChange('today') }}
        className="mb-6 pl-2 text-left hover:opacity-70 transition-opacity flex-shrink-0"
        aria-label="Go to tasks"
      >
        <Logo size={26} />
      </button>

      {/* Nav */}
      <div className="flex flex-col gap-0.5 flex-1">
        {PRIMARY_TABS.map(t => (
          <NavButton key={t.id} t={t} active={activeTab === t.id} onClick={() => onTabChange(t.id)} />
        ))}

        {/* More — collapsed by default, de-emphasized when open */}
        <button
          onClick={() => setMoreOpen(o => !o)}
          className="hover-surface hover-text flex items-center gap-2.5 px-2.5 py-2 mt-2 rounded-xl text-sm font-medium transition-all text-left"
          style={{ color: 'var(--text-faint)' }}
          aria-expanded={moreOpen}
        >
          <span className="text-sm w-4 text-center">{moreOpen ? '▾' : '▸'}</span>
          More
        </button>
        {moreOpen && (
          <div className="flex flex-col gap-0.5 pl-1">
            {MORE_TABS.map(t => (
              <NavButton key={t.id} t={t} active={activeTab === t.id} onClick={() => onTabChange(t.id)} small />
            ))}
          </div>
        )}
      </div>

      {/* Theme switcher — expanded pill (desktop has room) */}
      {theme && onSetTheme && (
        <div className="mt-4 flex-shrink-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2"
            style={{ color: 'var(--text-faint)' }}
          >
            Appearance
          </p>
          <ThemeToggle theme={theme} onSetTheme={onSetTheme} compact={false} />
        </div>
      )}

      {/* User menu */}
      <div className="mt-3 flex-shrink-0 border-t pt-3" style={{ borderColor: 'var(--border-soft)' }}>
        <UserMenu />
      </div>
    </nav>
  )
}
