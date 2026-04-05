// Component: TodaySummaryBar
// Purpose: Row of 3 quick-stat cards showing tasks done, habit %, and streak
import Card from '../ui/Card'

export default function TodaySummaryBar({ tasks, habits }) {
  const done      = tasks.getTodayTasks().filter(t => t.completed).length
  const total     = tasks.getTodayTasks().length
  const habitPct  = habits.getTodayCompletion()
  const streak    = habits.getMaxStreak()

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="text-center">
        <p className="text-xs text-ink-faint uppercase tracking-wider mb-1">Tasks</p>
        <p className="font-serif text-2xl text-ink">{done}<span className="text-ink-faint text-lg">/{total}</span></p>
        <p className="text-[11px] text-ink-faint mt-0.5">done today</p>
      </Card>
      <Card className="text-center">
        <p className="text-xs text-ink-faint uppercase tracking-wider mb-1">Habits</p>
        <p className="font-serif text-2xl text-forest-500">{habitPct}%</p>
        <p className="text-[11px] text-ink-faint mt-0.5">completed</p>
      </Card>
      <Card className="text-center">
        <p className="text-xs text-ink-faint uppercase tracking-wider mb-1">Streak</p>
        <p className="font-serif text-2xl text-terracotta-500">{streak}🔥</p>
        <p className="text-[11px] text-ink-faint mt-0.5">days</p>
      </Card>
    </div>
  )
}
