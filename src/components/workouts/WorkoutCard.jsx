// Component: WorkoutCard
// Purpose: One workout session — type badge, exercises, sets toggle, complete, edit, delete
import { useState, useEffect, memo } from 'react'
import { Play } from 'lucide-react'

const TYPE_COLORS = {
  Strength:   { bg: 'var(--tone-sage-bg)', text: 'var(--tone-sage-text)' },
  Cardio:     { bg: 'var(--tone-blue-bg)', text: 'var(--tone-blue-text)' },
  HIIT:       { bg: 'var(--tone-amber-bg)', text: 'var(--tone-amber-text)' },
  Yoga:       { bg: 'var(--tone-violet-bg)', text: 'var(--tone-violet-text)' },
  Stretching: { bg: 'var(--tone-emerald-bg)', text: 'var(--tone-emerald-text)' },
  Running:    { bg: 'var(--tone-yellow-bg)', text: 'var(--tone-yellow-text)' },
  Cycling:    { bg: 'var(--tone-sky-bg)', text: 'var(--tone-sky-text)' },
  Swimming:   { bg: 'var(--tone-emerald-bg)', text: 'var(--tone-emerald-text)' },
  Sport:      { bg: 'var(--tone-orange-bg)', text: 'var(--tone-orange-text)' },
  Other:      { bg: 'var(--bg-secondary)', text: 'var(--text-muted)' },
}

const WorkoutCardImpl = memo(function WorkoutCard({ session, workouts, onEdit, onStart }) {
  const [expanded, setExpanded] = useState(false)
  // Reset expanded state when session identity changes (prevents state leak after memo reuse)
  useEffect(() => { setExpanded(false) }, [session.id])

  const colors    = TYPE_COLORS[session.type] || TYPE_COLORS.Other
  const totalSets = session.exercises.reduce((n, e) => n + e.sets.length, 0)
  const doneSets  = session.exercises.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0)
  const pct       = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0

  return (
    <div
      className="rounded-2xl border overflow-hidden card-hover"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor:     session.completed ? 'var(--accent-mid)' : 'var(--border)',
        boxShadow:       'var(--shadow-card)',
        opacity:         session.completed ? 0.75 : 1,
      }}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {session.type}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                {session.date}
              </span>
              {session.durationMins && (
                <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                  · {session.durationMins}min
                </span>
              )}
            </div>

            <p
              className="text-sm font-semibold"
              style={{
                color:          session.completed ? 'var(--text-faint)' : 'var(--text)',
                textDecoration: session.completed ? 'line-through' : 'none',
              }}
            >
              {session.title}
            </p>

            {session.muscleGroups.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {session.muscleGroups.map(mg => (
                  <span
                    key={mg}
                    className="text-[10px] px-1.5 py-0.5 rounded border"
                    style={{ color: 'var(--text-faint)', borderColor: 'var(--border)' }}
                  >
                    {mg}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => workouts.toggleComplete(session.id)}
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs transition-all"
              style={session.completed
                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                : { borderColor: 'var(--border)' }
              }
              title={session.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {session.completed && '✓'}
            </button>
            <button
              onClick={() => onEdit(session)}
              className="hover-surface w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
              style={{ color: 'var(--text-faint)' }}
            >
              ✏️
            </button>
            <button
              onClick={() => workouts.deleteSession(session.id)}
              className="hover-danger w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
              style={{ color: 'var(--text-faint)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {totalSets > 0 && (
          <div className="mt-3">
            <div className="flex justify-between mb-1">
              <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                {session.exercises.length} exercise{session.exercises.length !== 1 ? 's' : ''}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                {doneSets}/{totalSets} sets
              </span>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
              />
            </div>
          </div>
        )}

        {/* Primary action — the focused runner, spec §27's discovery-card CTA */}
        {onStart && session.exercises.length > 0 && !session.completed && (
          <button
            onClick={() => onStart(session)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Play size={14} aria-hidden="true" /> Start Workout
          </button>
        )}

        {/* Toggle expand */}
        {session.exercises.length > 0 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-2.5 text-xs font-medium transition-colors flex items-center gap-1"
            style={{ color: 'var(--accent-text)' }}
          >
            <span
              style={{
                display:    'inline-block',
                transition: 'transform 0.15s',
                transform:  expanded ? 'rotate(90deg)' : 'none',
              }}
            >▶</span>
            {expanded ? 'Hide' : 'View'} exercises
          </button>
        )}
      </div>

      {/* Exercise detail */}
      {expanded && (
        <div
          className="border-t px-4 pt-3 pb-4 space-y-3"
          style={{ borderColor: 'var(--border-soft)' }}
        >
          {session.exercises.map(ex => (
            <div key={ex.id}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
                {ex.name}
              </p>
              {ex.sets.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {ex.sets.map((set, si) => (
                    <button
                      key={set.id}
                      onClick={() => workouts.toggleSet(session.id, ex.id, set.id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg border transition-all"
                      style={set.done
                        ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                        : { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                      }
                    >
                      S{si + 1}
                      {set.weight ? ` ${set.weight}${set.unit}` : ''}
                      {set.reps   ? ` ×${set.reps}`              : ''}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic" style={{ color: 'var(--text-faint)' }}>No sets logged</p>
              )}
            </div>
          ))}

          {session.notes && (
            <p
              className="text-xs italic mt-2 pt-2 border-t"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border-soft)' }}
            >
              {session.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
})
export default WorkoutCardImpl
