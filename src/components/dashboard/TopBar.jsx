// Component: TopBar
// Purpose: Sticky header with theme-aware glass background
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../utils/dateUtils'

const TITLES = {
  today:'Today', tasks:'Tasks', notes:'Notes', habits:'Habits',
  goals:'Goals', focus:'Focus', search:'Search', insights:'Insights',
  timeblock:'Schedule', calendar:'Calendar', ideas:'Ideas',
  braindump:'Brain Dump', routines:'Routines', challenges:'Challenges',
  balance:'Balance', projects:'Projects', bookmarks:'Bookmarks',
}

export default function TopBar({ activeTab, onTabChange }) {
  const navigate = useNavigate()
  return (
    <header
      className="sticky top-0 z-30 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-3 border-b glass"
      style={{ borderColor: 'var(--border-soft)' }}
    >
      <button onClick={() => navigate('/')}
        className="md:hidden font-serif text-xl leading-none flex-shrink-0"
        style={{ color: 'var(--text)' }}>
        Day<em className="not-italic text-forest-500">Flow</em>
      </button>

      <div className="flex-1 text-right md:text-left">
        <h1 className="font-serif text-xl md:text-2xl leading-none" style={{ color: 'var(--text)' }}>
          {TITLES[activeTab] ?? 'DayFlow'}
        </h1>
        <p className="text-[11px] mt-0.5 hidden sm:block" style={{ color: 'var(--text-faint)' }}>
          {formatDate(new Date())}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onTabChange('search')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          title="Search (/)">🔍
        </button>
        <button
          onClick={() => navigate('/')}
          className="hidden md:flex items-center gap-1 text-xs transition-colors"
          style={{ color: 'var(--text-faint)' }}>
          ← Home
        </button>
      </div>
    </header>
  )
}
