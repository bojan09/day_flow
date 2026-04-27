// Component: HeroPreview
// Purpose: Premium mini dashboard card shown in the hero — theme-aware mockup
const TASKS = [
  { label: 'Morning workout',    done: true  },
  { label: 'Review project PRs', done: true  },
  { label: 'Write journal entry',done: false },
  { label: '3pm team standup',   done: false },
]
const HABITS = [
  { label: 'Exercise', pct: 87 },
  { label: 'Reading',  pct: 71 },
  { label: 'Hydration',pct: 60 },
]

export default function HeroPreview() {
  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-2xl border overflow-hidden shadow-2xl"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-1.5 px-4 py-3 border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="text-xs ml-2" style={{ color: 'var(--text-faint)' }}>DayFlow — Today</span>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5">
        {/* Tasks */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
            Today's Tasks
          </p>
          {TASKS.map(t => (
            <div key={t.label} className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[10px] border-2"
                style={t.done
                  ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                  : { borderColor: 'var(--border)' }
                }
              >{t.done ? '✓' : ''}</span>
              <span
                className={`text-xs ${t.done ? 'line-through' : ''}`}
                style={{ color: t.done ? 'var(--text-faint)' : 'var(--text)' }}
              >{t.label}</span>
            </div>
          ))}
        </div>

        {/* Habits */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>Habits</p>
          <p className="font-serif text-3xl mb-3 [color:var(--accent)]">12🔥</p>
          <div className="space-y-2.5">
            {HABITS.map(h => (
              <div key={h.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{h.label}</span>
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{h.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${h.pct}%`, backgroundColor: 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>Today's Note</p>
          <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
            <p className="text-xs leading-relaxed italic font-serif" style={{ color: 'var(--text-muted)' }}>
              "Feeling focused. Shipped the auth module and cleared my inbox."
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Mood: Energized</span>
          </div>
        </div>
      </div>
    </div>
  )
}
