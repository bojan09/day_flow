// Component: ChallengesWidget
// Purpose: Mini Today dashboard card — active challenges with day counts.
import { memo } from 'react'
import { differenceInDays } from 'date-fns'

function ChallengesWidget({ challenges, onTabChange }) {
  const active = (challenges?.challenges || []).filter(c => c.active).slice(0, 3)

  if (active.length === 0) return (
    <div className="px-4 py-3 text-center">
      <p className="text-sm italic" style={{ color: 'var(--text-faint)' }}>No active challenges</p>
      <button type="button" onClick={() => onTabChange?.('challenges')}
        className="mt-2 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
        Start a challenge →
      </button>
    </div>
  )

  return (
    <div className="space-y-2.5 px-4 pb-3">
      {active.map(c => {
        const started  = new Date(c.startDate)
        const elapsed  = differenceInDays(new Date(), started)
        const duration = c.durationDays || 30
        const pct      = Math.min(Math.round((elapsed / duration) * 100), 100)

        return (
          <button type="button" key={c.id}
            onClick={() => onTabChange?.('challenges')}
            className="w-full text-left space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {c.emoji} {c.title}
              </span>
              <span className="text-xs" style={{ color: 'var(--accent)' }}>
                Day {elapsed}/{duration}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }} />
            </div>
          </button>
        )
      })}
      <button type="button" onClick={() => onTabChange?.('challenges')}
        className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
        View all challenges →
      </button>
    </div>
  )
}

export default memo(ChallengesWidget)
