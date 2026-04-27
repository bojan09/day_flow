// Component: SideNav
// Purpose: Desktop sidebar — sectioned nav, expanded theme switcher, user menu.
//          Logo always goes to /dashboard.
import { useNavigate } from 'react-router-dom'
import UserMenu    from '../auth/UserMenu'
import ThemeToggle from '../ui/ThemeToggle'

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
    { id: 'insights', label: 'Insights', emoji: '📊' },
    { id: 'balance',  label: 'Balance',  emoji: '⚖️' },
    { id: 'focus',    label: 'Focus',    emoji: '⏱️' },
    { id: 'search',   label: 'Search',   emoji: '🔍' },
    { id: 'achievements', label: 'Achievements', emoji: '🏅' },
  ]},
]

export default function SideNav({ activeTab, onTabChange, theme, onSetTheme }) {
  const navigate = useNavigate()

  return (
    <nav
      className="fixed top-0 left-0 h-screen w-60 flex flex-col py-5 px-3 z-40 overflow-y-auto scrollbar-hide border-r"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <button
        onClick={() => { navigate('/dashboard'); onTabChange('tasks') }}
        className="font-serif text-xl mb-6 pl-2 text-left hover:opacity-70 transition-opacity flex-shrink-0"
        style={{ color: 'var(--text)' }}
        aria-label="Go to tasks"
      >
        Day<em className="not-italic [color:var(--accent)]">Flow</em>
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
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all text-left"
                  style={activeTab === t.id
                    ? { backgroundColor: 'var(--accent)', color: 'white' }
                    : { color: 'var(--text-muted)' }
                  }
                  onMouseOver={e => {
                    if (activeTab !== t.id) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                  }}
                  onMouseOut={e => {
                    if (activeTab !== t.id) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
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
