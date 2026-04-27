// Component: AnalyticsPanel
// Purpose: Weekly productivity stats — tasks completed, category breakdown, completion rate
import Card from '../ui/Card'
import { subDays, format } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

const CATEGORY_COLORS = {
  Work:     'bg-blue-400',
  Personal: '[background-color:var(--accent-mid)]',
  Health:   'bg-emerald-400',
  Learning: 'bg-violet-400',
  Finance:  'bg-amber-400',
  Other:    '[background-color:var(--border)]',
}

export default function AnalyticsPanel({ tasks }) {
  const last7Keys = Array.from({ length: 7 }, (_, i) => getDateKey(subDays(new Date(), i)))

  const weekTasks    = tasks.tasks.filter(t => last7Keys.includes(t.date))
  const completed    = weekTasks.filter(t => t.completed).length
  const total        = weekTasks.length
  const rate         = total > 0 ? Math.round((completed / total) * 100) : 0

  // Group by category
  const catMap = weekTasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1
    return acc
  }, {})
  const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1])

  // Daily completion for sparkline
  const daily = last7Keys.reverse().map(key => ({
    label: format(new Date(key), 'EEE'),
    done:  tasks.tasks.filter(t => t.date === key && t.completed).length,
    total: tasks.tasks.filter(t => t.date === key).length,
  }))

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'This Week', val: total,     sub: 'tasks added' },
          { label: 'Completed', val: completed, sub: 'tasks done' },
          { label: 'Rate',      val: `${rate}%`,sub: 'completion' },
        ].map(s => (
          <Card key={s.label} className="text-center !p-4">
            <p className="text-xs [color:var(--text-faint)] uppercase tracking-wider mb-1">{s.label}</p>
            <p className="font-serif text-2xl [color:var(--accent)]">{s.val}</p>
            <p className="text-[11px] [color:var(--text-faint)] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Daily bar chart */}
      <Card>
        <p className="text-xs font-medium uppercase tracking-wider [color:var(--text-faint)] mb-4">Daily Completions</p>
        <div className="flex items-end gap-2 h-20">
          {daily.map(d => {
            const pct = d.total > 0 ? (d.done / d.total) * 100 : 0
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] [color:var(--text-faint)]">{d.done}/{d.total}</span>
                <div className="w-full [background-color:var(--bg-secondary)] rounded-t-md" style={{ height: '48px' }}>
                  <div
                    className="w-full [background-color:var(--accent)] rounded-t-md transition-all duration-500"
                    style={{ height: `${pct}%`, minHeight: d.total > 0 ? '4px' : '0' }}
                  />
                </div>
                <span className="text-[10px] [color:var(--text-faint)]">{d.label}</span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Category breakdown */}
      {categories.length > 0 && (
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider [color:var(--text-faint)] mb-3">By Category</p>
          <div className="space-y-2.5">
            {categories.map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm [color:var(--text)]">{cat}</span>
                    <span className="text-xs [color:var(--text-faint)]">{count} task{count > 1 ? 's' : ''}</span>
                  </div>
                  <div className="h-1.5 [background-color:var(--bg-secondary)] rounded-full">
                    <div
                      className={`h-full rounded-full transition-all ${CATEGORY_COLORS[cat] ?? '[background-color:var(--border)]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
