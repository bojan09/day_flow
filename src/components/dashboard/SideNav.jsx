// Component: SideNav
// Purpose: Desktop left sidebar — full navigation for all app sections
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    label: 'Plan',
    tabs: [
      { id: 'today',      label: 'Today',      emoji: '☀️' },
      { id: 'tasks',      label: 'Tasks',      emoji: '✅' },
      { id: 'calendar',   label: 'Calendar',   emoji: '📅' },
      { id: 'timeblock',  label: 'Schedule',   emoji: '⏰' },
      { id: 'projects',   label: 'Projects',   emoji: '🗂️' },
    ]
  },
  {
    label: 'Build',
    tabs: [
      { id: 'habits',     label: 'Habits',     emoji: '🔁' },
      { id: 'routines',   label: 'Routines',   emoji: '🌅' },
      { id: 'challenges', label: 'Challenges', emoji: '🎯' },
      { id: 'goals',      label: 'Goals',      emoji: '🏆' },
    ]
  },
  {
    label: 'Think',
    tabs: [
      { id: 'notes',      label: 'Notes',      emoji: '📝' },
      { id: 'ideas',      label: 'Ideas',      emoji: '💡' },
      { id: 'braindump',  label: 'Brain Dump', emoji: '🧠' },
      { id: 'bookmarks',  label: 'Bookmarks',  emoji: '🔖' },
    ]
  },
  {
    label: 'Reflect',
    tabs: [
      { id: 'insights',   label: 'Insights',   emoji: '📊' },
      { id: 'balance',    label: 'Balance',    emoji: '⚖️' },
      { id: 'focus',      label: 'Focus',      emoji: '⏱️' },
      { id: 'search',     label: 'Search',     emoji: '🔍' },
    ]
  },
]

export default function SideNav({ activeTab, onTabChange }) {
  const navigate = useNavigate()
  return (
    <nav className="fixed top-0 left-0 h-screen w-56 bg-white border-r border-stone-100 flex flex-col py-5 px-3 z-40 overflow-y-auto scrollbar-hide">
      <button onClick={() => navigate('/')}
        className="font-serif text-xl text-ink mb-5 text-left pl-2 hover:opacity-70 transition-opacity flex-shrink-0">
        Day<em className="not-italic text-forest-500">Flow</em>
      </button>

      <div className="flex flex-col gap-4 flex-1">
        {SECTIONS.map(section => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint px-2 mb-1">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.tabs.map(t => (
                <button key={t.id} onClick={() => onTabChange(t.id)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === t.id
                      ? 'bg-forest-500 text-white shadow-sm'
                      : 'text-ink-muted hover:bg-stone-50 hover:text-ink'
                  }`}>
                  <span className="text-sm w-4 text-center">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/')}
        className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm text-ink-faint hover:bg-stone-50 hover:text-ink transition-all flex-shrink-0 mt-3">
        <span className="w-4 text-center">🏠</span> Home
      </button>
    </nav>
  )
}
