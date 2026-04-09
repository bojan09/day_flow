// Component: BottomNav
// Purpose: Mobile bottom nav with theme-aware glass surface and safe-area padding
import { useNavigate } from 'react-router-dom'

const TABS = [
  { id: 'today',    label: 'Today',  emoji: '☀️' },
  { id: 'tasks',    label: 'Tasks',  emoji: '✅' },
  { id: 'ideas',    label: 'Ideas',  emoji: '💡' },
  { id: 'habits',   label: 'Habits', emoji: '🔁' },
  { id: 'insights', label: 'More',   emoji: '⋯'  },
]

export default function BottomNav({ activeTab, onTabChange }) {
  const navigate = useNavigate()
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around glass border-t pb-safe"
      style={{ borderColor: 'var(--border)' }}
    >
      <button
        onClick={() => navigate('/')}
        className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 transition-colors"
        style={{ color: 'var(--text-faint)' }}
      >
        <span className="text-lg">🏠</span>
        <span className="text-[10px] font-medium">Home</span>
      </button>
      <div className="w-px my-2" style={{ backgroundColor: 'var(--border)' }} />
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-1.5 transition-colors flex-1 no-select"
          style={{ color: activeTab === t.id ? 'var(--accent)' : 'var(--text-faint)' }}
        >
          <span className={`text-lg transition-transform duration-150 ${activeTab === t.id ? 'scale-110' : ''}`}>
            {t.emoji}
          </span>
          <span className="text-[10px] font-medium">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
