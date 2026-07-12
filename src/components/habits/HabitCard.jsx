// Component: HabitCard
// Purpose: One habit as its own card — name, today's toggle, 7-day streak strip.
//          Replaces the shared weekly-grid row. `last7` is an array of 7
//          booleans/nulls (done/not-done/future) for the current week, oldest
//          first — computed by the caller from `log` (see HabitsView).
import { memo } from 'react'
import { habitDisplayName } from '../../utils/habitLabels'

function HabitCard({ habit, doneToday, last7, onToggleToday, streak, frequencyLabel, onEdit, onDelete }) {
  const name = habitDisplayName(habit)
  return (
    <div className="group rounded-2xl p-4 flex items-center justify-between gap-3"
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          aria-label={`Mark ${name} ${doneToday ? 'not done' : 'done'} today`}
          aria-pressed={doneToday}
          onClick={() => onToggleToday(habit.id)}
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-base transition-all"
          style={{
            backgroundColor: doneToday ? 'var(--accent)' : 'var(--bg-secondary)',
            color: doneToday ? '#fff' : 'var(--text-faint)',
          }}>
          {doneToday ? '✓' : habit.icon || '○'}
        </button>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {frequencyLabel && (
              <span className="text-[10px] capitalize flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{frequencyLabel}</span>
            )}
            {streak > 0 && (
              <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: 'var(--accent)' }}>🔥{streak}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(habit.id)}
              aria-label="Edit habit"
              className="tap-target w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors"
              style={{ color: 'var(--text-faint)' }}
              title="Edit habit"
            >✏️</button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(habit.id)}
              aria-label="Delete habit"
              className="tap-target hover-danger w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors"
              style={{ color: 'var(--text-faint)' }}
              title="Delete habit"
            >✕</button>
          )}
        </div>
        <div className="flex gap-1">
          {last7.map((state, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded"
              style={{
                backgroundColor: state === true ? 'var(--accent)' : state === false ? 'var(--accent-mid)' : 'var(--border-soft)',
              }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(HabitCard)
