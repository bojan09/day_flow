// Component: ProgressRing
// Purpose: Polished circular progress ring for the day with theme-aware colors
export default function ProgressRing({ tasks, habits }) {
  const todayTasks = tasks.getTodayTasks()
  const taskDone   = todayTasks.filter(t => t.completed).length
  const taskTotal  = todayTasks.length
  const habitPct   = habits.getTodayCompletion()

  const taskScore = taskTotal > 0 ? (taskDone / taskTotal) * 100 : 0
  const overall   = taskTotal === 0 && habits.habits.length === 0 ? 0
    : taskTotal === 0 ? habitPct
    : habits.habits.length === 0 ? taskScore
    : Math.round(taskScore * 0.6 + habitPct * 0.4)

  const R    = 36
  const circ = 2 * Math.PI * R
  const dash = (overall / 100) * circ

  const ringColor = overall >= 80 ? '#3B6B4B' : overall >= 50 ? '#5A9E6F' : '#A7C9A0'

  return (
    <div
      className="rounded-2xl border p-5 flex items-center gap-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="relative flex-shrink-0">
        <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
          <circle cx="45" cy="45" r={R} fill="none" stroke="var(--border)" strokeWidth="7" />
          <circle cx="45" cy="45" r={R} fill="none"
            stroke={ringColor} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition: 'stroke-dasharray 0.7s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-xl leading-none" style={{ color: 'var(--text)' }}>{overall}%</span>
          <span className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>done</span>
        </div>
      </div>

      <div className="flex-1 space-y-2.5">
        {[
          { label: 'Tasks',  val: `${taskDone}/${taskTotal}`, pct: taskTotal > 0 ? (taskDone/taskTotal)*100 : 0 },
          { label: 'Habits', val: `${habitPct}%`,             pct: habitPct },
        ].map(row => (
          <div key={row.label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{row.val}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${row.pct}%`, backgroundColor: 'var(--accent)' }} />
            </div>
          </div>
        ))}
        <p className="text-[11px] italic" style={{ color: 'var(--text-faint)' }}>
          {overall === 100 ? '🎉 Perfect day!' : overall >= 80 ? '🔥 Almost there!' : overall >= 50 ? '💪 Keep going' : "Let's get started"}
        </p>
      </div>
    </div>
  )
}
