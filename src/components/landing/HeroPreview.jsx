// Component: HeroPreview
// Purpose: Decorative mini dashboard card shown in the hero section

const TASKS = [
  { label: 'Morning workout',    done: true },
  { label: 'Review project PRs', done: true },
  { label: 'Journal entry',      done: false },
  { label: '3pm team standup',   done: false },
]

const HABITS = [
  { label: 'Exercise', pct: 87 },
  { label: 'Reading',  pct: 71 },
  { label: 'Hydration',pct: 60 },
]

export default function HeroPreview() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-stone-100 shadow-xl overflow-hidden opacity-0 animate-fade-up-d3">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 bg-stone-50 border-b border-stone-100">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="text-xs text-ink-faint ml-2">DayFlow — Tuesday, today</span>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5">
        {/* Tasks */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-3">Today's Tasks</p>
          {TASKS.map(t => (
            <div key={t.label} className="flex items-center gap-2.5">
              <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] flex-shrink-0 border ${t.done ? 'bg-forest-500 border-forest-500 text-white' : 'border-stone-300'}`}>
                {t.done ? '✓' : ''}
              </span>
              <span className={`text-xs ${t.done ? 'line-through text-ink-faint' : 'text-ink'}`}>{t.label}</span>
            </div>
          ))}
        </div>

        {/* Habits */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-3">Habits</p>
          <p className="font-serif text-3xl text-forest-500 mb-3">12🔥</p>
          <div className="space-y-2.5">
            {HABITS.map(h => (
              <div key={h.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-ink-muted">{h.label}</span>
                  <span className="text-xs text-ink-faint">{h.pct}%</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full">
                  <div className="h-full bg-forest-500 rounded-full transition-all" style={{ width: `${h.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-3">Today's Note</p>
          <div className="bg-parchment rounded-xl p-3 border border-stone-100">
            <p className="text-xs text-ink-muted leading-relaxed italic font-serif">
              "Feeling focused. Shipped the auth module and cleared my inbox. Going to hit the gym after standup."
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-forest-500" />
            <span className="text-xs text-ink-faint">Mood: Energized</span>
          </div>
        </div>
      </div>
    </div>
  )
}
