// Component: YearlyChain
// Purpose: "Don't break the chain" — full year contribution grid showing daily activity
import { format, startOfYear, addDays, getDay } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'
import Card from '../ui/Card'

export default function YearlyChain({ tasks, habits, mood }) {
  const today     = new Date()
  const yearStart = startOfYear(today)
  const totalDays = Math.floor((today - yearStart) / 86400000) + 1

  // Build activity map: dateKey -> intensity (0-3)
  const activityMap = {}
  for (let i = 0; i < totalDays; i++) {
    const d   = addDays(yearStart, i)
    const key = getDateKey(d)
    let score = 0

    const dayTasks = tasks.tasks.filter(t => t.date === key)
    if (dayTasks.some(t => t.completed))      score += 1
    if (mood.getMoodForDate(key))              score += 1
    if (habits.habits.some(h => habits.log[`${h.id}_${key}`])) score += 1

    activityMap[key] = score
  }

  // Build weeks grid
  const days = Array.from({ length: totalDays }, (_, i) => {
    const d   = addDays(yearStart, i)
    const key = getDateKey(d)
    return { date: d, key, score: activityMap[key] || 0 }
  })

  // Pad to start on Monday
  const firstDow = (getDay(yearStart) + 6) % 7 // Mon=0
  const padded   = [...Array(firstDow).fill(null), ...days]
  const weeks    = []
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7))

  const COLORS = ['[background-color:var(--bg-secondary)]', '[background-color:var(--accent-light)]', '[background-color:var(--accent-mid)]', '[background-color:var(--accent)]']
  const streak = (() => {
    let s = 0
    const cursor = new Date()
    while (true) {
      const key = getDateKey(cursor)
      if ((activityMap[key] || 0) > 0) { s++; cursor.setDate(cursor.getDate() - 1) }
      else break
    }
    return s
  })()

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider [color:var(--text-faint)]">Activity This Year</p>
        <span className="text-sm font-semibold text-terracotta-500">{streak}🔥 day streak</span>
      </div>

      {/* Month labels */}
      <div className="flex gap-0.5 mb-1 overflow-x-auto scrollbar-hide">
        {weeks.map((_, wi) => {
          const firstReal = weeks[wi]?.find(d => d)
          const label = firstReal && firstReal.date.getDate() <= 7
            ? format(firstReal.date, 'MMM')
            : ''
          return <div key={wi} className="w-3 flex-shrink-0 text-[8px] [color:var(--text-faint)] leading-none">{label}</div>
        })}
      </div>

      {/* Grid */}
      <div className="flex gap-0.5 overflow-x-auto scrollbar-hide">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5 flex-shrink-0">
            {(week.length < 7 ? [...week, ...Array(7 - week.length).fill(null)] : week).map((day, di) => (
              <div
                key={di}
                title={day ? `${day.key} · ${day.score > 0 ? `${day.score} activities` : 'No activity'}` : ''}
                className={`w-3 h-3 rounded-sm transition-colors ${
                  !day ? 'bg-transparent' : COLORS[Math.min(day.score, 3)]
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[9px] [color:var(--text-faint)]">Less</span>
        {COLORS.map((c, i) => <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c}`} />)}
        <span className="text-[9px] [color:var(--text-faint)]">More</span>
      </div>
    </Card>
  )
}
