// Component: WeeklyPersonalBest
// Purpose: Surface "your best week ever" stats and compare to current week
import Card from '../ui/Card'
import { subDays } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

export default function WeeklyPersonalBest({ tasks, habits }) {
  const getWeekStats = (daysAgo) => {
    const keys = Array.from({ length: 7 }, (_, i) => getDateKey(subDays(new Date(), daysAgo + i)))
    const weekTasks = tasks.tasks.filter(t => keys.includes(t.date))
    const done      = weekTasks.filter(t => t.completed).length
    const habitDays = habits.habits.reduce((sum, h) =>
      sum + keys.filter(k => habits.log[`${h.id}_${k}`]).length, 0)
    const maxPossible = habits.habits.length * 7
    const habitPct  = maxPossible > 0 ? Math.round((habitDays / maxPossible) * 100) : 0
    return { done, total: weekTasks.length, habitPct }
  }

  const thisWeek = getWeekStats(0)

  // Find best week in last 12 weeks
  const weeks = Array.from({ length: 12 }, (_, i) => getWeekStats(i * 7))
  const best  = weeks.reduce((b, w) => (w.done + w.habitPct / 10 > b.done + b.habitPct / 10 ? w : b), weeks[0])

  const taskPct  = best.done > 0 ? Math.round((thisWeek.done / best.done) * 100) : 100
  const habitComp = best.habitPct > 0 ? Math.round((thisWeek.habitPct / best.habitPct) * 100) : 100

  const rows = [
    { label: 'Tasks done',  current: thisWeek.done,      best: best.done,      suffix: '' },
    { label: 'Habit rate',  current: thisWeek.habitPct,  best: best.habitPct,  suffix: '%' },
  ]

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wider [color:var(--text-faint)] mb-4">🏆 vs Your Best Week</p>
      <div className="space-y-4">
        {rows.map(row => {
          const pct = row.best > 0 ? Math.min(100, Math.round((row.current / row.best) * 100)) : 100
          return (
            <div key={row.label}>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm [color:var(--text)]">{row.label}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold [color:var(--text)]">{row.current}{row.suffix}</span>
                  <span className="text-xs [color:var(--text-faint)]">/ best: {row.best}{row.suffix}</span>
                </div>
              </div>
              <div className="h-2 [background-color:var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-terracotta-500' : pct >= 75 ? '[background-color:var(--accent)]' : '[background-color:var(--accent-light)]'}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="text-[10px] [color:var(--text-faint)] mt-0.5 text-right">
                {pct >= 100 ? '🎉 New personal best!' : `${pct}% of your best`}
              </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
