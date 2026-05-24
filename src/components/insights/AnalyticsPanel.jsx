// Component: AnalyticsPanel
// Purpose: Weekly productivity stats — completion rate, daily bar chart, category breakdown.
//          No Card dependency — uses CSS variables throughout.
import { useMemo } from 'react'
import { subDays, format } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

import AnimatedBar from '../ui/AnimatedBar'

const CAT_COLORS = {
  Work:     '#3B82F6',
  Personal: '#3B6B4B',
  Health:   '#10B981',
  Learning: '#7C3AED',
  Finance:  '#F59E0B',
  Other:    '#9CA3AF',
}

function StatCard({ label, value, sub, color = 'var(--accent)' }) {
  return (
    <div
      className="flex flex-col items-center text-center p-4 rounded-2xl border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>
        {label}
      </p>
      <p className="font-serif text-2xl leading-none" style={{ color }}>{value}</p>
      <p className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>{sub}</p>
    </div>
  )
}

export default function AnalyticsPanel({ tasks }) {
  const last7Keys = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => getDateKey(subDays(new Date(), i))),
  [])

  // All calculations memoised on tasks.tasks reference
  const { weekTasks, completed, total, rate, categories, daily, maxDone } = useMemo(() => {
    const weekTasks  = tasks.tasks.filter(t => last7Keys.includes(t.date))
    const completed  = weekTasks.filter(t => t.completed).length
    const total      = weekTasks.length
    const rate       = total > 0 ? Math.round((completed / total) * 100) : 0
    const catMap     = weekTasks.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1
      return acc
    }, {})
    const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1])
    const daily      = [...last7Keys].reverse().map(key => ({
      label: format(new Date(key + 'T12:00:00'), 'EEE'),
      done:  tasks.tasks.filter(t => t.date === key && t.completed).length,
      total: tasks.tasks.filter(t => t.date === key).length,
    }))
    const maxDone = Math.max(...daily.map(d => d.done), 1)
    return { weekTasks, completed, total, rate, categories, daily, maxDone }
  }, [tasks.tasks, last7Keys])

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="This Week"  value={total}      sub="tasks added" />
        <StatCard label="Completed"  value={completed}  sub="tasks done"  />
        <StatCard label="Rate"       value={`${rate}%`} sub="completion"
          color={rate >= 80 ? '#10B981' : rate >= 50 ? '#F59E0B' : '#EF4444'} />
      </div>

      {/* Daily bar chart */}
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
          Daily Completions
        </p>
        <div className="flex items-end gap-2" style={{ height: '80px' }}>
          {daily.map(d => {
            const barH = d.total > 0 ? Math.max((d.done / maxDone) * 64, 4) : 2
            const pct  = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{d.done > 0 ? d.done : ''}</span>
                <div className="w-full rounded-t-md flex items-end" style={{ height: '56px', backgroundColor: 'var(--bg-secondary)' }}>
                  <div
                    className="w-full rounded-t-md transition-all duration-700"
                    style={{
                      height:          `${barH}px`,
                      backgroundColor: pct >= 80 ? '#10B981' : pct >= 50 ? 'var(--accent)' : '#F59E0B',
                    }}
                  />
                </div>
                <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{d.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category breakdown */}
      {categories.length > 0 && (
        <div
          className="rounded-2xl border p-5"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
            By Category
          </p>
          <div className="space-y-3">
            {categories.map(([cat, count]) => {
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0
              const color = CAT_COLORS[cat] || '#9CA3AF'
              return (
                <div key={cat}>
                  <div className="flex justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{cat}</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {count} task{count > 1 ? 's' : ''} · {pct}%
                    </span>
                  </div>
                  <AnimatedBar pct={pct} color={color} delay={categories.indexOf(cat) * 80} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
