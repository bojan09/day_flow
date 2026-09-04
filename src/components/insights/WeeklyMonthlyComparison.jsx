// Component: WeeklyMonthlyComparison
// Purpose: Period-over-period stats — this week vs last week, this month vs last month.
//          Shows deltas with trend arrows so user sees if they're improving.
import { useMemo } from 'react'
import { subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

function Delta({ value, unit = '%' }) {
  if (value === null || value === 0) return (
    <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>→ same</span>
  )
  const positive = value > 0
  return (
    <span
      className="text-[11px] font-semibold flex items-center gap-0.5"
      style={{ color: positive ? '#10B981' : '#EF4444' }}
    >
      {positive ? '↑' : '↓'} {Math.abs(value)}{unit}
    </span>
  )
}

function CompareCard({ label, current, previous, unit = '', higherIsBetter = true }) {
  const delta   = current !== null && previous !== null ? current - previous : null
  const isGood  = delta === null ? null : (higherIsBetter ? delta >= 0 : delta <= 0)
  const bgColor = isGood === null ? 'var(--surface)' : isGood ? '#F0FDF4' : '#FEF2F2'
  const valColor = isGood === null ? 'var(--text)' : isGood ? '#065F46' : '#991B1B'

  return (
    <div
      className="flex flex-col gap-1 p-4 rounded-2xl"
      style={{ backgroundColor: bgColor, boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
        {label}
      </p>
      <div className="flex items-end gap-2">
        <span className="font-serif text-2xl leading-none" style={{ color: valColor }}>
          {current !== null ? `${current}${unit}` : '—'}
        </span>
        {previous !== null && (
          <span className="text-[11px] mb-0.5" style={{ color: 'var(--text-faint)' }}>
            prev {previous}{unit}
          </span>
        )}
      </div>
      {delta !== null && <Delta value={delta} unit={unit} />}
    </div>
  )
}

export default function WeeklyMonthlyComparison({ tasks, habits, mood }) {
  const stats = useMemo(() => {
    const today = new Date()

    // Week ranges
    const thisWeekDays = Array.from({ length: 7 }, (_, i) => getDateKey(subDays(today, i)))
    const lastWeekDays = Array.from({ length: 7 }, (_, i) => getDateKey(subDays(today, i + 7)))

    // Month ranges
    const thisMonthStart = startOfMonth(today)
    const thisMonthEnd   = endOfMonth(today)
    const lastMonthStart = startOfMonth(subMonths(today, 1))
    const lastMonthEnd   = endOfMonth(subMonths(today, 1))

    function getMonthDays(start, end) {
      const days = []
      let cur = new Date(start)
      while (cur <= end) {
        days.push(getDateKey(cur))
        cur = subDays(cur, -1)
      }
      return days
    }

    const thisMonthDays = getMonthDays(thisMonthStart, thisMonthEnd)
    const lastMonthDays = getMonthDays(lastMonthStart, lastMonthEnd)

    function taskRate(days) {
      const ts = tasks.tasks.filter(t => days.includes(t.date))
      return ts.length > 0 ? Math.round((ts.filter(t => t.completed).length / ts.length) * 100) : null
    }

    function taskCount(days) {
      return tasks.tasks.filter(t => days.includes(t.date) && t.completed).length
    }

    function habitPct(days) {
      if (habits.habits.length === 0) return null
      const possible = habits.habits.length * days.length
      const done     = habits.habits.reduce((sum, h) =>
        sum + days.filter(d => habits.isHabitDone(h.id, d)).length, 0)
      return possible > 0 ? Math.round((done / possible) * 100) : null
    }

    function avgMood(days) {
      const entries = days.map(d => mood.getMoodForDate(d)).filter(Boolean)
      return entries.length > 0
        ? Math.round((entries.reduce((s, e) => s + e.score, 0) / entries.length) * 10) / 10
        : null
    }

    return {
      week: {
        taskRate:  { current: taskRate(thisWeekDays),  previous: taskRate(lastWeekDays)  },
        taskCount: { current: taskCount(thisWeekDays), previous: taskCount(lastWeekDays) },
        habitPct:  { current: habitPct(thisWeekDays),  previous: habitPct(lastWeekDays)  },
        avgMood:   { current: avgMood(thisWeekDays),   previous: avgMood(lastWeekDays)   },
      },
      month: {
        taskRate:  { current: taskRate(thisMonthDays),  previous: taskRate(lastMonthDays)  },
        taskCount: { current: taskCount(thisMonthDays), previous: taskCount(lastMonthDays) },
        habitPct:  { current: habitPct(thisMonthDays),  previous: habitPct(lastMonthDays)  },
        avgMood:   { current: avgMood(thisMonthDays),   previous: avgMood(lastMonthDays)   },
      },
    }
  // Keyed on the underlying data rather than the hook objects, which are new
  // on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks.tasks, habits.habits, habits.log, mood.moods])

  return (
    <div className="space-y-4">
      {/* Weekly comparison */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
          📅 This Week vs Last Week
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CompareCard label="Task rate"   unit="%" {...stats.week.taskRate}  />
          <CompareCard label="Tasks done"  unit=""  {...stats.week.taskCount} />
          <CompareCard label="Habit rate"  unit="%" {...stats.week.habitPct}  />
          <CompareCard label="Avg mood"    unit="/5" higherIsBetter {...stats.week.avgMood} />
        </div>
      </div>

      {/* Monthly comparison */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
          🗓 {format(new Date(), 'MMMM')} vs {format(subMonths(new Date(), 1), 'MMMM')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CompareCard label="Task rate"   unit="%" {...stats.month.taskRate}  />
          <CompareCard label="Tasks done"  unit=""  {...stats.month.taskCount} />
          <CompareCard label="Habit rate"  unit="%" {...stats.month.habitPct}  />
          <CompareCard label="Avg mood"    unit="/5" higherIsBetter {...stats.month.avgMood} />
        </div>
      </div>
    </div>
  )
}
