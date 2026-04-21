// Component: TopBar
// Purpose: Sticky dashboard header — page title, date, theme toggle, search, sync status.
//          Solid background, no glassmorphism.
import { useNavigate }  from 'react-router-dom'
import { formatDate }   from '../../utils/dateUtils'
import SyncIndicator    from '../ui/SyncIndicator'
import ThemeToggle      from '../ui/ThemeToggle'

const TITLES = {
  today:      'Today',      tasks:      'Tasks',
  notes:      'Notes',      habits:     'Habits',
  goals:      'Goals',      focus:      'Focus',
  search:     'Search',     insights:   'Insights',
  balance:    'Balance',    workouts:   'Workouts',
  timeblock:  'Schedule',   calendar:   'Calendar',
  ideas:      'Ideas',      braindump:  'Brain Dump',
  routines:   'Routines',   challenges: 'Challenges',
  projects:   'Projects',   bookmarks:  'Bookmarks',
  achievements: 'Achievements',
}

export default function TopBar({ activeTab, onTabChange, theme, onSetTheme }) {
  const navigate = useNavigate()

  return (
    <header
      className="sticky top-0 z-30 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-3 border-b"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-soft)' }}
    >
      {/* Mobile logo */}
      <button
        onClick={() => { navigate('/dashboard'); onTabChange('tasks') }}
        className="md:hidden font-serif text-xl leading-none flex-shrink-0"
        style={{ color: 'var(--text)' }}
      >
        Day<em className="not-italic text-forest-500">Flow</em>
      </button>

      {/* Title + date */}
      <div className="flex-1 text-right md:text-left min-w-0">
        <h1
          className="font-serif text-xl md:text-2xl leading-none truncate"
          style={{ color: 'var(--text)' }}
        >
          {TITLES[activeTab] ?? 'DayFlow'}
        </h1>
        <p className="text-[11px] mt-0.5 hidden sm:block" style={{ color: 'var(--text-faint)' }}>
          {formatDate(new Date())}
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <SyncIndicator />

        {/* Theme toggle — compact single-button cycle */}
        {theme && onSetTheme && (
          <ThemeToggle theme={theme} onSetTheme={onSetTheme} compact />
        )}

        <button
          onClick={() => onTabChange('search')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Search (/)"
          aria-label="Search"
        >
          🔍
        </button>
      </div>
    </header>
  )
}
