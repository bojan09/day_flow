// Component: CategoryTrends
// Purpose: Shows per-category task completion trends over 4 weeks.
//          Helps identify which areas of life are getting attention vs. neglected.
import { useMemo } from 'react'
import { subDays, format } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

const CAT_COLORS = {
  Work:     '#3B82F6',
  Personal: '#3B6B4B',
  Health:   '#10B981',
  Learning: '#7C3AED',
  Finance:  '#F59E0B',
  Other:    '#9CA3AF',
}

function getColor(cat) {
  return CAT_COLORS[cat] || '#9CA3AF'
}

export default function CategoryTrends({ tasks }) {
  const { weeks, categories } = useMemo(() => {
    // Build 4 week windows
    const weeks = Array.from({ length: 4 }, (_, i) => {
      const end   = subDays(new Date(), i * 7)
      const start = subDays(end, 6)
      const days  = Array.from({ length: 7 }, (_, j) =>
        getDateKey(subDays(end, j))
      )
      return {
        label:  i === 0 ? 'This week' : i === 1 ? 'Last week' : `${i * 7}d ago`,
        days,
        start,
        end,
      }
    }).reverse()

    // Find all categories used
    const allCats = [...new Set(tasks.tasks.map(t => t.category).filter(Boolean))]

    // Per category, per week: completion rate
    const categories = allCats.map(cat => {
      const weekData = weeks.map(w => {
        const catTasks = tasks.tasks.filter(
          t => t.category === cat && w.days.includes(t.date)
        )
        const done  = catTasks.filter(t => t.completed).length
        const total = catTasks.length
        return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : null }
      })
      const totalTasks = weekData.reduce((s, w) => s + w.total, 0)
      return { cat, weekData, totalTasks }
    }).filter(c => c.totalTasks > 0)
      .sort((a, b) => b.totalTasks - a.totalTasks)

    return { weeks, categories }
  }, [tasks.tasks])

  if (categories.length === 0) {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-sm italic" style={{ color: 'var(--text-faint)' }}>
          Add categorised tasks to see trends.
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
        📁 Category Trends — 4 Weeks
      </p>

      {/* Week headers */}
      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: '80px repeat(4, 1fr)' }}>
        <div />
        {weeks.map(w => (
          <div key={w.label} className="text-center">
            <p className="text-[10px] font-semibold" style={{ color: 'var(--text-faint)' }}>
              {w.label}
            </p>
          </div>
        ))}
      </div>

      {/* Category rows */}
      <div className="space-y-3">
        {categories.slice(0, 8).map(({ cat, weekData }) => {
          const color = getColor(cat)
          return (
            <div key={cat}>
              {/* Label row */}
              <div className="grid gap-2 items-center mb-1" style={{ gridTemplateColumns: '80px repeat(4, 1fr)' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{cat}</span>
                </div>
                {weekData.map((w, i) => (
                  <div key={i} className="text-center">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: w.pct === null ? 'var(--text-faint)' : w.pct >= 80 ? '#10B981' : w.pct >= 50 ? color : '#EF4444' }}
                    >
                      {w.pct === null ? '—' : `${w.pct}%`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mini bar row */}
              <div className="grid gap-2" style={{ gridTemplateColumns: '80px repeat(4, 1fr)' }}>
                <div />
                {weekData.map((w, i) => (
                  <div key={i} className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width:           w.pct !== null ? `${w.pct}%` : '0%',
                        backgroundColor: color,
                        opacity:         w.pct !== null ? 1 : 0,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
