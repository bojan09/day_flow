// Component: SideNav
// Purpose: Desktop sidebar — sectioned nav, expanded theme switcher, user menu.
//          Logo always goes to /dashboard.
import { useNavigate } from 'react-router-dom'
import UserMenu    from '../auth/UserMenu'
import ThemeToggle from '../ui/ThemeToggle'
import Logo        from '../ui/Logo'

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
    { id: 'goals',      label: 'Goals',      emoji: '🏆' },
    { id: 'workouts',   label: 'Workouts',   emoji: '🏋️' },
  ]},
  { label: 'Think', tabs: [
    { id: 'capture', label: 'Capture', emoji: '📥' },
  ]},
  { label: 'Reflect', tabs: [
    { id: 'insights', label: 'Insights', emoji: '📊' },
    { id: 'focus',    label: 'Focus',    emoji: '⏱️' },
    { id: 'search',   label: 'Search',   emoji: '🔍' },
  ]},
]


// Preload lazy chunks when user hovers a nav item
const PRELOAD_MAP = {
  capture:    () => import('../capture/CaptureView'),
  goals:      () => import('../goals/GoalsView'),
  insights:   () => import('../insights/InsightsView'),
  workouts:   () => import('../workouts/WorkoutsView'),
  calendar:   () => import('../calendar/CalendarView'),
  routines:   () => import('../routines/RoutinesView'),
  projects:   () => import('../projects/ProjectsView'),
  search:     () => import('../search/SearchView'),
}
const preload = (id) => PRELOAD_MAP[id]?.()

export default function SideNav({ activeTab, onTabChange, theme, onSetTheme }) {
  const navigate = useNavigate()

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

      {/* Nav sections */}
      <div className="flex flex-col gap-5 flex-1">
        {SECTIONS.map(section => (
          <div key={section.label}>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5"
              style={{ color: 'var(--text-faint)' }}
            >
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => onTabChange(t.id)}
                  className={`${activeTab === t.id ? '' : 'hover-surface hover-text'} flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all text-left`}
                  style={activeTab === t.id
                    ? {
                        background:  'linear-gradient(90deg, var(--accent) 0%, var(--accent-mid) 100%)',
                        color:       'white',
                        boxShadow:   '0 2px 8px rgba(59,107,75,0.25)',
                      }
                    : { color: 'var(--text-muted)' }
                  }
                >
                  <span className="text-sm w-4 text-center">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ))}
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
