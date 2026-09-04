// Component: WorkoutsWidget
// Purpose: Mini Today dashboard card — shows today's workout or quick-log prompt.
import { memo } from 'react'
import { getTodayKey } from '../../../utils/dateUtils'

function WorkoutsWidget({ workouts, onTabChange }) {
  const today      = getTodayKey()
  const todaySess  = (workouts?.sessions || []).filter(s => s.date === today)
  const weekCount  = workouts?.getTotalThisWeek?.() ?? 0

  return (
    <div className="px-4 pb-3 space-y-2">
      {/* Week bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {weekCount} session{weekCount !== 1 ? 's' : ''} this week
        </p>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i}
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: i < weekCount ? 'var(--accent)' : 'var(--border)' }}
            />
          ))}
        </div>
      </div>

      {/* Today's sessions */}
      {todaySess.length === 0 ? (
        <button type="button" onClick={() => onTabChange?.('workouts')}
          className="w-full py-2.5 rounded-xl border text-xs font-semibold transition-all"
          style={{ borderColor: 'var(--accent-mid)', color: 'var(--accent-text)', backgroundColor: 'var(--accent-light)' }}>
          🏋️ Log today's workout
        </button>
      ) : (
        <div className="space-y-1.5">
          {todaySess.slice(0, 3).map(s => (
            <div key={s.id} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: s.completed ? 'var(--text-faint)' : 'var(--text)' }}>
                {s.completed ? '✓ ' : ''}{s.title}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{s.durationMins}min</span>
            </div>
          ))}
          <button type="button" onClick={() => onTabChange?.('workouts')}
            className="text-xs font-medium" style={{ color: 'var(--accent-text)' }}>
            View workouts →
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(WorkoutsWidget)
