// Component: WorkoutStatsBar
// Purpose: Top stat cards — this week, total sessions, personal bests count
export default function WorkoutStatsBar({ workouts }) {
  const thisWeek = workouts.getTotalThisWeek()
  const total    = workouts.sessions.length
  const pbs      = workouts.getPersonalBests().length

  const stats = [
    { label: 'This week',      value: thisWeek, sub: 'sessions', color: 'var(--accent-text)'  },
    { label: 'All time',       value: total,    sub: 'logged',   color: 'var(--text)'    },
    { label: 'Personal bests', value: pbs,      sub: 'tracked',  color: '#C4622D'        },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(s => (
        <div
          key={s.label}
          className="rounded-2xl border p-4 text-center"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor:     'var(--border)',
            boxShadow:       'var(--shadow-card)',
          }}
        >
          <p
            className="text-[10px] font-medium uppercase tracking-wider mb-1"
            style={{ color: 'var(--text-faint)' }}
          >
            {s.label}
          </p>
          <p className="font-serif text-2xl leading-none" style={{ color: s.color }}>
            {s.value}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
            {s.sub}
          </p>
        </div>
      ))}
    </div>
  )
}
