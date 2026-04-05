// Component: SideNav
// Purpose: Fixed desktop left sidebar with navigation links and logo
import { useNavigate } from 'react-router-dom'

const TABS = [
  { id: 'today',    label: 'Today',    emoji: '☀️' },
  { id: 'tasks',    label: 'Tasks',    emoji: '✅' },
  { id: 'notes',    label: 'Notes',    emoji: '📝' },
  { id: 'habits',   label: 'Habits',   emoji: '🔁' },
  { id: 'insights', label: 'Insights', emoji: '📊' },
]

export default function SideNav({ activeTab, onTabChange }) {
  const navigate = useNavigate()
  return (
    <nav className="fixed top-0 left-0 h-screen w-56 bg-white border-r border-stone-100 flex flex-col py-6 px-4 z-40">
      <button onClick={() => navigate('/')} className="font-serif text-xl text-ink mb-8 text-left pl-2 hover:opacity-70 transition-opacity">
        Day<em className="not-italic text-forest-500">Flow</em>
      </button>
      <div className="flex flex-col gap-1 flex-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
              activeTab === t.id
                ? 'bg-forest-500 text-white shadow-sm'
                : 'text-ink-muted hover:bg-stone-50 hover:text-ink'
            }`}
          >
            <span className="text-base">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-ink-faint hover:bg-stone-50 hover:text-ink transition-all"
      >
        <span>🏠</span> Home
      </button>
    </nav>
  )
}
