// Component: FastingWidget
// Purpose: Mini Today dashboard card for fasting — the same glance-and-act
//          shape as WorkoutsWidget, so the daily fasting state (currently
//          fasting / not / streak) is visible on the home screen instead of
//          requiring a trip to the Fasting tab.
//
// Self-hooks into useFasting rather than taking fasting state as a prop:
// it is a standalone persisted-state hook, so wiring it through TodayView's
// prop chain would add plumbing for no benefit.
import { memo } from 'react'
import { Play, Square } from 'lucide-react'
import { useFasting } from '../../../hooks/useFasting'
import { formatDuration } from '../../../services/fastingModel'

function FastingWidget({ onTabChange }) {
  const fasting = useFasting()
  const { active, progress, plan, stats } = fasting

  if (active) {
    return (
      <div className="px-4 pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-serif text-2xl leading-none" style={{ color: 'var(--text)' }}>
            {formatDuration(progress.elapsedMs)}
          </p>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            of {active.targetHours}h
          </span>
        </div>

        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
          role="progressbar"
          aria-valuenow={Math.min(100, progress.percent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, progress.percent)}%`, backgroundColor: 'var(--accent)' }}
          />
        </div>

        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          {progress.reachedTarget ? 'Target reached' : `${formatDuration(progress.remainingMs)} remaining`}
        </p>

        <button
          type="button"
          onClick={() => onTabChange?.('fasting')}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <Square size={13} aria-hidden="true" /> Open fasting
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pb-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {plan ? `${plan.fastHours}:${plan.eatHours} plan` : 'No plan yet'}
        </p>
        {stats.currentStreak > 0 && (
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {stats.currentStreak} day streak
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => (plan ? fasting.begin() : onTabChange?.('fasting'))}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all"
        style={{ borderColor: 'var(--accent-mid)', color: 'var(--accent-text)', backgroundColor: 'var(--accent-light)' }}
      >
        <Play size={13} aria-hidden="true" /> {plan ? 'Start fasting' : 'Choose a plan'}
      </button>
    </div>
  )
}

export default memo(FastingWidget)
