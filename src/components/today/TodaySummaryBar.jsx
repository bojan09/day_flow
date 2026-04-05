// Component: TodaySummaryBar
// Purpose: 3 summary stat cards — tasks, habits, estimate for the day
import Card from '../ui/Card'

export default function TodaySummaryBar({ tasks, habits }) {
  const done      = tasks.getTodayTasks().filter(t => t.completed).length
  const total     = tasks.getTodayTasks().length
  const habitPct  = habits.getTodayCompletion()
  const estMins   = tasks.getTotalEstimateMins()
  const estLabel  = estMins >= 60
    ? `${Math.floor(estMins / 60)}h ${estMins % 60 ? estMins % 60 + 'm' : ''}`
    : estMins > 0 ? `${estMins}m` : '—'

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="text-center !p-4">
        <p className="text-xs text-ink-faint uppercase tracking-wider mb-1">Tasks</p>
        <p className="font-serif text-2xl text-ink">{done}<span className="text-ink-faint text-lg">/{total}</span></p>
        <p className="text-[11px] text-ink-faint mt-0.5">done today</p>
      </Card>
      <Card className="text-center !p-4">
        <p className="text-xs text-ink-faint uppercase tracking-wider mb-1">Habits</p>
        <p className="font-serif text-2xl text-forest-500">{habitPct}%</p>
        <p className="text-[11px] text-ink-faint mt-0.5">completed</p>
      </Card>
      <Card className="text-center !p-4">
        <p className="text-xs text-ink-faint uppercase tracking-wider mb-1">Est. Time</p>
        <p className="font-serif text-2xl text-terracotta-500">{estLabel}</p>
        <p className="text-[11px] text-ink-faint mt-0.5">planned</p>
      </Card>
    </div>
  )
}
