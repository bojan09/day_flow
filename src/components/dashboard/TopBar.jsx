// Component: TopBar
// Purpose: Top header bar showing current page title and today's date
import { formatDate } from '../../utils/dateUtils'

const TITLES = {
  today:  'Today',
  tasks:  'Tasks',
  notes:  'Notes',
  habits: 'Habits',
}

export default function TopBar({ activeTab }) {
  return (
    <header className="sticky top-0 z-30 bg-parchment/90 backdrop-blur-sm border-b border-stone-100 px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-serif text-2xl text-ink leading-none">{TITLES[activeTab] ?? 'DayFlow'}</h1>
        <p className="text-xs text-ink-faint mt-0.5">{formatDate(new Date())}</p>
      </div>
    </header>
  )
}
