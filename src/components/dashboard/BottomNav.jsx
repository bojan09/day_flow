// Component: BottomNav
// Purpose: Mobile-only fixed bottom navigation — Home + 5 app tabs
import { useNavigate } from 'react-router-dom'

const TABS = [
  { id: 'today',    label: 'Today',   emoji: '☀️' },
  { id: 'tasks',    label: 'Tasks',   emoji: '✅' },
  { id: 'notes',    label: 'Notes',   emoji: '📝' },
  { id: 'habits',   label: 'Habits',  emoji: '🔁' },
  { id: 'insights', label: 'Insights',emoji: '📊' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  const navigate = useNavigate()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-stone-100 flex items-stretch justify-around">
      <button
        onClick={() => navigate('/')}
        className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 text-ink-faint hover:text-ink transition-colors"
      >
        <span className="text-lg">🏠</span>
        <span className="text-[10px] font-medium">Home</span>
      </button>
      <div className="w-px bg-stone-100 my-2" />
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`flex flex-col items-center justify-center gap-0.5 py-2.5 px-1.5 transition-colors flex-1 ${
            activeTab === t.id ? 'text-forest-500' : 'text-ink-faint hover:text-ink'
          }`}
        >
          <span className={`text-lg transition-transform ${activeTab === t.id ? 'scale-110' : ''}`}>{t.emoji}</span>
          <span className="text-[10px] font-medium">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
