// Component: TopBar
// Purpose: Sticky header — DayFlow logo (mobile = home), page title, search shortcut
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../utils/dateUtils'

const TITLES = {
  today: 'Today', tasks: 'Tasks', notes: 'Notes', habits: 'Habits',
  goals: 'Goals', focus: 'Focus', search: 'Search', insights: 'Insights',
  timeblock: 'Schedule',
}

export default function TopBar({ activeTab, onTabChange }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 bg-parchment/90 backdrop-blur-sm border-b border-stone-100 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-3">
      <button onClick={() => navigate('/')}
        className="md:hidden font-serif text-xl text-ink leading-none flex-shrink-0">
        Day<em className="not-italic text-forest-500">Flow</em>
      </button>
      <div className="flex-1 text-right md:text-left">
        <h1 className="font-serif text-xl md:text-2xl text-ink leading-none">
          {TITLES[activeTab] ?? 'DayFlow'}
        </h1>
        <p className="text-[11px] text-ink-faint mt-0.5 hidden sm:block">{formatDate(new Date())}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onTabChange('search')}
          className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-ink-muted hover:text-ink transition-colors text-sm"
          title="Search">🔍</button>
        <button onClick={() => navigate('/')}
          className="hidden md:flex items-center gap-1 text-xs text-ink-faint hover:text-ink transition-colors">
          ← Home
        </button>
      </div>
    </header>
  )
}
