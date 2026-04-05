// Component: BottomNav
// Purpose: Mobile-only fixed bottom navigation bar

const TABS = [
  { id: 'today',  label: 'Today',  emoji: '☀️' },
  { id: 'tasks',  label: 'Tasks',  emoji: '✅' },
  { id: 'notes',  label: 'Notes',  emoji: '📝' },
  { id: 'habits', label: 'Habits', emoji: '🔁' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-100 flex items-center justify-around px-2 pb-safe">
      {TABS.map(t => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`flex flex-col items-center gap-0.5 py-3 px-4 transition-colors ${
            activeTab === t.id ? 'text-forest-500' : 'text-ink-faint'
          }`}
        >
          <span className="text-xl">{t.emoji}</span>
          <span className="text-[10px] font-medium">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
