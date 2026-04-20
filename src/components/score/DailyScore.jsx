// Component: DailyScore
// Purpose: Day's report card — score, grade, category breakdown.
//          Shows an encouraging empty state when nothing has been logged yet.
const GRADE_COLORS = {
  'A+': { bg: '#EEF4ED', border: '#A7C9A0', text: '#2A4E36' },
  'A':  { bg: '#EEF4ED', border: '#A7C9A0', text: '#2A4E36' },
  'B':  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  'C':  { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  'D':  { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412' },
  'F':  { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
}

const BREAKDOWN_LABELS = {
  tasks:     { label: 'Tasks',     max: 35, emoji: '✅' },
  habits:    { label: 'Habits',    max: 30, emoji: '🔁' },
  mood:      { label: 'Mood',      max: 15, emoji: '😌' },
  gratitude: { label: 'Gratitude', max: 10, emoji: '🙏' },
  water:     { label: 'Hydration', max: 10, emoji: '💧' },
}

export default function DailyScore({ scoreData }) {
  const { total, grade, message, breakdown, meta } = scoreData
  const colors    = GRADE_COLORS[grade] || GRADE_COLORS['F']
  const nothingYet = total === 0

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Grade circle */}
        <div
          className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 font-serif text-2xl font-bold"
          style={{ backgroundColor: nothingYet ? 'var(--bg-secondary)' : colors.bg, borderColor: nothingYet ? 'var(--border)' : colors.border, color: nothingYet ? 'var(--text-faint)' : colors.text }}
        >
          {nothingYet ? '–' : grade}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-faint)' }}>
            Today's Score
          </p>
          {nothingYet ? (
            <p className="text-sm leading-snug" style={{ color: 'var(--text-muted)' }}>
              Log tasks, habits, or mood to build your score.
            </p>
          ) : (
            <>
              <p className="font-serif text-3xl leading-none" style={{ color: 'var(--text)' }}>
                {total}<span className="text-lg" style={{ color: 'var(--text-faint)' }}>/100</span>
              </p>
              <p className="text-xs italic mt-1" style={{ color: 'var(--text-muted)' }}>{message}</p>
            </>
          )}
        </div>
      </div>

      {/* Breakdown bars — only show if any points scored */}
      {!nothingYet && (
        <div className="space-y-2.5">
          {Object.entries(breakdown).map(([key, val]) => {
            const m = BREAKDOWN_LABELS[key]
            if (!m) return null
            const pct = Math.round((val / m.max) * 100)
            return (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <span>{m.emoji}</span>{m.label}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    {val}/{m.max}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
