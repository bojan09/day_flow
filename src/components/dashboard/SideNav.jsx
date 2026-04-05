// Component: SideNav
// Purpose: Fixed desktop left sidebar with navigation links and logo
import { useNavigate } from 'react-router-dom'

const TABS = [
  { id: 'today',  label: 'Today',  emoji: '☀️' },
  { id: 'tasks',  label: 'Tasks',  emoji: '✅' },
  { id: 'notes',  label: 'Notes',  emoji: '📝' },
  { id: 'habits', label: 'Habits', emoji: '🔁' },
]

export default function SideNav({ activeTab, onTabChange }) {
  const navigate = useNavigate()
  return (
    <nav className="fixed top-0 left-0 h-screen w-56 bg-white border-r border-stone-100 flex flex-col py-6 px-4 z-40">
      {/* Logo */}
      <button onClick={() => navigate('/')} className="font-serif text-xl text-ink mb-8 text-left pl-2">
        Day<em className="not-italic text-forest-500">Flow</em>
      </button>

      {/* Nav items */}
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

      {/* User stub */}
      <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors mt-4">
        <div className="w-7 h-7 rounded-full bg-forest-100 flex items-center justify-center text-xs font-semibold text-forest-700">
          U
        </div>
        <span className="text-sm text-ink-muted font-medium">My Account</span>
      </div>
    </nav>
  )
}
