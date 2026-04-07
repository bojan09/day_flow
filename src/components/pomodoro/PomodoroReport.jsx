// Component: PomodoroReport
// Purpose: Weekly focus session bar chart + best day and average stats
import Card from '../ui/Card'

export default function PomodoroReport({ pomodoroHistory }) {
  const report = pomodoroHistory.getWeeklyReport()
  const maxSessions = Math.max(...report.days.map(d => d.sessions), 1)

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-4">⏱ Focus Sessions This Week</p>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Sessions',     val: report.totalSessions },
          { label: 'Avg duration', val: `${report.avgMins}m`  },
          { label: 'Best day',     val: report.bestDay?.label || '—' },
        ].map(s => (
          <div key={s.label} className="bg-parchment rounded-xl p-3 text-center">
            <p className="font-serif text-lg text-ink">{s.val}</p>
            <p className="text-[10px] text-ink-faint uppercase tracking-wide mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-16">
        {report.days.map(d => {
          const pct = (d.sessions / maxSessions) * 100
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              {d.sessions > 0 && (
                <span className="text-[10px] text-ink-faint">{d.sessions}</span>
              )}
              <div className="w-full bg-stone-100 rounded-t-md" style={{ height: '40px' }}>
                <div
                  className="w-full bg-violet-400 rounded-t-md transition-all duration-500"
                  style={{ height: `${pct}%`, minHeight: d.sessions > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-[10px] text-ink-faint">{d.label}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
