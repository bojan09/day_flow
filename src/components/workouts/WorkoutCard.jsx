// Component: WorkoutCard
// Purpose: One workout session — type badge, exercises, sets toggle, complete, edit, delete
import { useState } from 'react'

const TYPE_COLORS = {
  Strength:   { bg: '#EEF4ED', text: '#2A4E36' },
  Cardio:     { bg: '#EFF6FF', text: '#1D4ED8' },
  HIIT:       { bg: '#FEF3C7', text: '#92400E' },
  Yoga:       { bg: '#F3E8FF', text: '#6B21A8' },
  Stretching: { bg: '#ECFDF5', text: '#065F46' },
  Running:    { bg: '#FEF9C3', text: '#713F12' },
  Cycling:    { bg: '#E0F2FE', text: '#0C4A6E' },
  Swimming:   { bg: '#F0FDF4', text: '#166534' },
  Sport:      { bg: '#FFF7ED', text: '#9A3412' },
  Other:      { bg: 'var(--bg-secondary)', text: 'var(--text-muted)' },
}

export default function WorkoutCard({ session, workouts, onEdit }) {
  const [expanded, setExpanded] = useState(false)

  const colors    = TYPE_COLORS[session.type] || TYPE_COLORS.Other
  const totalSets = session.exercises.reduce((n, e) => n + e.sets.length, 0)
  const doneSets  = session.exercises.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0)
  const pct       = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0

  return (
    <div
      className="rounded-2xl border overflow-hidden"
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
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
              style={{ color: 'var(--text-faint)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ✏️
            </button>
            <button
              onClick={() => workouts.deleteSession(session.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
              style={{ color: 'var(--text-faint)' }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#fef2f2'
                e.currentTarget.style.color = '#ef4444'
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--text-faint)'
              }}
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

        {/* Toggle expand */}
        {session.exercises.length > 0 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-2.5 text-xs font-medium transition-colors flex items-center gap-1"
            style={{ color: 'var(--accent)' }}
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
}
