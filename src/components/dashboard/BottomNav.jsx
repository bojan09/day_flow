// Component: BottomNav
// Purpose: Mobile bottom navigation bar — 4 primary tabs + "More" drawer trigger.
//          Larger tap targets (min 48px), active pill indicator, haptic-style scale feedback.
//          "More" opens the MobileDrawer, does NOT navigate to a tab.

const PRIMARY_TABS = [
  { id: 'today',  label: 'Today',  emoji: '☀️' },
  { id: 'tasks',  label: 'Tasks',  emoji: '✅' },
  { id: 'habits', label: 'Habits', emoji: '🔁' },
  { id: 'focus',  label: 'Focus',  emoji: '⏱️' },
]

export default function BottomNav({ activeTab, onTabChange, onOpenDrawer }) {
  const isMoreActive = !PRIMARY_TABS.find(t => t.id === activeTab)

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t pb-safe"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-stretch justify-around">
        {PRIMARY_TABS.map(t => {
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px] relative transition-all active:scale-95"
              style={{ color: active ? 'var(--accent)' : 'var(--text-faint)' }}
              aria-label={t.label}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active pill indicator */}
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
              <span
                className="text-xl leading-none transition-transform duration-150"
                style={{ transform: active ? 'scale(1.15)' : 'scale(1)' }}
              >
                {t.emoji}
              </span>
              <span
                className="text-[10px] font-medium tracking-tight"
                style={{ fontWeight: active ? 600 : 400 }}
              >
                {t.label}
              </span>
            </button>
          )
        })}

        {/* More — opens the full drawer */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px] relative transition-all active:scale-95"
          style={{ color: isMoreActive ? 'var(--accent)' : 'var(--text-faint)' }}
          aria-label="More navigation options"
          aria-haspopup="dialog"
        >
          {isMoreActive && (
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
          )}
          {/* Animated grid icon */}
          <span
            className="grid grid-cols-2 gap-[3px] w-5 h-5 transition-transform duration-150"
            style={{ transform: isMoreActive ? 'scale(1.15)' : 'scale(1)' }}
          >
            {[0,1,2,3].map(i => (
              <span
                key={i}
                className="rounded-[2px]"
                style={{ backgroundColor: isMoreActive ? 'var(--accent)' : 'var(--text-faint)' }}
              />
            ))}
          </span>
          <span
            className="text-[10px] tracking-tight"
            style={{ fontWeight: isMoreActive ? 600 : 400 }}
          >
            More
          </span>
        </button>
      </div>
    </nav>
  )
}
