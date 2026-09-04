// Component: GoalsWidget
// Purpose: Mini Today dashboard card — shows active goals with progress %.
import { memo } from 'react'

function GoalsWidget({ goals, onTabChange }) {
  const active = (goals?.goals || []).filter(g => !g.completed).slice(0, 4)

  if (active.length === 0) return (
    <div className="px-4 py-3 text-center">
      <p className="text-sm italic" style={{ color: 'var(--text-faint)' }}>No active goals</p>
      <button type="button" onClick={() => onTabChange?.('goals')}
        className="mt-2 text-xs font-semibold" style={{ color: 'var(--accent-text)' }}>
        + Set a goal
      </button>
    </div>
  )

  return (
    <div className="space-y-2.5 px-4 pb-3">
      {active.map(g => {
        const pct = goals.getProgress ? goals.getProgress(g) : 0
        return (
          <button type="button" key={g.id}
            onClick={() => onTabChange?.('goals')}
            className="w-full flex items-center gap-3 text-left"
          >
            {/* Mini ring */}
            <svg width="32" height="32" viewBox="0 0 32 32" className="-rotate-90 flex-shrink-0">
              <circle cx="16" cy="16" r="12" fill="none" stroke="var(--border)" strokeWidth="3" />
              <circle cx="16" cy="16" r="12" fill="none"
                stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 75.4} 75.4`} />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                {g.emoji} {g.title}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                {pct}% · {g.type}
              </p>
            </div>
          </button>
        )
      })}
      <button type="button" onClick={() => onTabChange?.('goals')}
        className="text-xs font-medium" style={{ color: 'var(--accent-text)' }}>
        View all goals →
      </button>
    </div>
  )
}

export default memo(GoalsWidget)
