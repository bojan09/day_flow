// Component: ProductivityHeatmap
// Purpose: GitHub-style full-year activity heatmap.
//          Each cell = one day. Colour intensity = tasks completed + habits done.
//          Hover shows date and count. Toggle between Tasks / Habits / Combined.
import { useMemo, useState } from 'react'
import { subDays, format, getDay } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

const VIEWS = ['Combined', 'Tasks', 'Habits']

function getIntensity(count, max) {
  if (count === 0 || max === 0) return 0
  const pct = count / max
  if (pct >= 0.75) return 4
  if (pct >= 0.5)  return 3
  if (pct >= 0.25) return 2
  return 1
}

const INTENSITY_COLORS = [
  'var(--bg-secondary)',   // 0 — empty
  'var(--accent-light)',   // 1 — light
  'var(--accent-mid)',     // 2 — medium
  'var(--accent)',         // 3 — strong
  '#1a3d28',              // 4 — max (overrides theme slightly for depth)
]

// DOW labels
const DOW_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function ProductivityHeatmap({ tasks, habits }) {
  const [view,    setView]    = useState('Combined')

  const { cells, weeks, maxCount } = useMemo(() => {
    const days = Array.from({ length: 365 }, (_, i) => {
      const d      = subDays(new Date(), 364 - i)
      const key    = getDateKey(d)
      const dayTasks = tasks.tasks.filter(t => t.date === key && t.completed).length
      const dayHabits = habits.habits.filter(h => habits.isHabitDone(h.id, key)).length
      const combined  = dayTasks + dayHabits
      return { d, key, dayTasks, dayHabits, combined }
    })

    let maxCount = 1
    days.forEach(d => {
      const v = view === 'Tasks' ? d.dayTasks : view === 'Habits' ? d.dayHabits : d.combined
      if (v > maxCount) maxCount = v
    })

    // Group into weeks (columns)
    const firstDOW = getDay(days[0].d)
    const padded   = Array(firstDOW).fill(null).concat(days)
    const weeks    = []
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7))
    }

    return { cells: days, weeks, maxCount }
  // Keyed on the underlying data, not the habits hook object, which is a new
  // reference every render and would defeat the memo.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks.tasks, habits.habits, habits.log, view])

  // Month labels — find first day of each month in the cells
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = -1
    weeks.forEach((week, wi) => {
      week.forEach(day => {
        if (!day) return
        const m = day.d.getMonth()
        if (m !== lastMonth) {
          labels.push({ weekIdx: wi, label: format(day.d, 'MMM') })
          lastMonth = m
        }
      })
    })
    return labels
  }, [weeks])

  const totalForView = cells.reduce((s, d) =>
    s + (view === 'Tasks' ? d.dayTasks : view === 'Habits' ? d.dayHabits : d.combined), 0)

  const activeDays = cells.filter(d =>
    (view === 'Tasks' ? d.dayTasks : view === 'Habits' ? d.dayHabits : d.combined) > 0
  ).length

  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
            📊 Activity — Last 365 Days
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {totalForView} {view === 'Tasks' ? 'tasks completed' : view === 'Habits' ? 'habits logged' : 'total activities'} · {activeDays} active days
          </p>
        </div>
        {/* View switcher */}
        <div
          className="flex gap-0.5 rounded-xl p-0.5"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          {VIEWS.map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={view === v
                ? { backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)', color: 'var(--text)' }
                : { color: 'var(--text-faint)' }
              }
            >{v}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-1">
        <div style={{ minWidth: `${weeks.length * 14}px` }}>
          {/* Month labels */}
          <div className="flex mb-1" style={{ marginLeft: '24px' }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find(l => l.weekIdx === wi)
              return (
                <div key={wi} style={{ width: '12px', marginRight: '2px', flexShrink: 0 }}>
                  {ml && (
                    <span
                      className="text-[9px] font-medium"
                      style={{ color: 'var(--text-faint)', whiteSpace: 'nowrap' }}
                    >
                      {ml.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* DOW labels + cells */}
          <div className="flex gap-0">
            {/* DOW labels column */}
            <div className="flex flex-col gap-0.5 mr-1.5 flex-shrink-0" style={{ width: '20px' }}>
              {DOW_LABELS.map((d, i) => (
                <div key={d} style={{ height: '12px' }}>
                  {i % 2 === 1 && (
                    <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>
                      {d.slice(0, 1)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5 mr-0.5 flex-shrink-0">
                {week.map((day, di) => {
                  if (!day) return <div key={di} style={{ width: '12px', height: '12px' }} />
                  const count     = view === 'Tasks' ? day.dayTasks : view === 'Habits' ? day.dayHabits : day.combined
                  const intensity = getIntensity(count, maxCount)
                  return (
                    <div
                      key={day.key}
                      className="rounded-sm cursor-pointer transition-all hover:ring-1"
                      style={{
                        width:           '12px',
                        height:          '12px',
                        backgroundColor: INTENSITY_COLORS[intensity],
                        ringColor:       'var(--accent)',
                      }}
                      title={`${format(day.d, 'MMM d, yyyy')}: ${count} ${view === 'Tasks' ? 'task' : view === 'Habits' ? 'habit' : 'activit'}${count !== 1 ? (view === 'Combined' ? 'ies' : 's') : (view === 'Combined' ? 'y' : '')}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
        ))}
        <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>More</span>
      </div>
    </div>
  )
}
