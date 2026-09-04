// Component: TodaySummaryBar
// Purpose: 3 stat cards — tasks, habits, estimated time — fully theme-aware
export default function TodaySummaryBar({ tasks, habits }) {
  const done     = tasks.getTodayTasks().filter(t => t.completed).length
  const total    = tasks.getTodayTasks().length
  const habitPct = habits.getTodayCompletion()
  const estMins  = tasks.getTotalEstimateMins()
  const estLabel = estMins >= 60
    ? `${Math.floor(estMins/60)}h${estMins%60 ? ` ${estMins%60}m` : ''}`
    : estMins > 0 ? `${estMins}m` : '—'

  const stats = [
    { label: 'Tasks',    val: `${done}`, sub: `of ${total} done`, color: 'var(--text)' },
    { label: 'Habits',   val: `${habitPct}%`, sub: 'completed',   color: 'var(--accent-text)' },
    { label: 'Est. Time',val: estLabel,  sub: 'planned',          color: '#C4622D' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(s => (
        <div key={s.label}
          className="rounded-2xl border p-4 text-center"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
          <p className="font-serif text-2xl leading-none" style={{ color: s.color }}>{s.val}</p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>{s.sub}</p>
        </div>
      ))}
    </div>
  )
}
