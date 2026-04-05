// Component: TopBar
// Purpose: Sticky header — DayFlow logo on mobile (tappable = home), page title, date
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../utils/dateUtils'

const TITLES = {
  today:    'Today',
  tasks:    'Tasks',
  notes:    'Notes',
  habits:   'Habits',
  insights: 'Insights',
}

export default function TopBar({ activeTab }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 bg-parchment/90 backdrop-blur-sm border-b border-stone-100 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-3">
      <button
        onClick={() => navigate('/')}
        className="md:hidden font-serif text-xl text-ink leading-none flex-shrink-0"
      >
        Day<em className="not-italic text-forest-500">Flow</em>
      </button>
      <div className="flex-1 text-right md:text-left">
        <h1 className="font-serif text-xl md:text-2xl text-ink leading-none">
          {TITLES[activeTab] ?? 'DayFlow'}
        </h1>
        <p className="text-[11px] text-ink-faint mt-0.5 hidden sm:block">{formatDate(new Date())}</p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="hidden md:flex items-center gap-1 text-xs text-ink-faint hover:text-ink transition-colors"
      >
        ← Home
      </button>
    </header>
  )
}
