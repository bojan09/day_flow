// Component: ProgressRing
// Purpose: Circular SVG progress ring showing combined task + habit completion for the day
export default function ProgressRing({ tasks, habits }) {
  const todayTasks    = tasks.getTodayTasks()
  const taskDone      = todayTasks.filter(t => t.completed).length
  const taskTotal     = todayTasks.length
  const habitPct      = habits.getTodayCompletion()

  // Weighted average: 60% tasks, 40% habits
  const taskScore     = taskTotal > 0 ? (taskDone / taskTotal) * 100 : 0
  const overall       = taskTotal === 0 && habits.habits.length === 0
    ? 0
    : taskTotal === 0
    ? habitPct
    : habits.habits.length === 0
    ? taskScore
    : Math.round(taskScore * 0.6 + habitPct * 0.4)

  const R   = 36
  const circ = 2 * Math.PI * R
  const dash = (overall / 100) * circ
  const gap  = circ - dash

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex items-center gap-5">
      {/* Ring */}
      <div className="relative flex-shrink-0">
        <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
          <circle cx="45" cy="45" r={R} fill="none" stroke="#F1EDE8" strokeWidth="7" />
          <circle
            cx="45" cy="45" r={R}
            fill="none"
            stroke={overall >= 80 ? '#3B6B4B' : overall >= 50 ? '#5A9E6F' : '#A7C9A0'}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-xl text-ink leading-none">{overall}%</span>
          <span className="text-[9px] text-ink-faint uppercase tracking-wide">done</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="flex-1 space-y-2.5">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-ink-muted">Tasks</span>
            <span className="text-xs font-medium text-ink">{taskDone}/{taskTotal}</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full">
            <div
              className="h-full bg-forest-500 rounded-full transition-all duration-500"
              style={{ width: taskTotal > 0 ? `${(taskDone / taskTotal) * 100}%` : '0%' }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-ink-muted">Habits</span>
            <span className="text-xs font-medium text-ink">{habitPct}%</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full">
            <div
              className="h-full bg-forest-400 rounded-full transition-all duration-500"
              style={{ width: `${habitPct}%` }}
            />
          </div>
        </div>
        <p className="text-[11px] text-ink-faint italic">
          {overall === 100 ? '🎉 Perfect day!' : overall >= 80 ? '🔥 Almost there!' : overall >= 50 ? '💪 Keep going' : "Let's get started"}
        </p>
      </div>
    </div>
  )
}
