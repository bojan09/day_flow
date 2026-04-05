// Component: MoodChart
// Purpose: Visual 7-day mood history as a simple bar chart
import Card from '../ui/Card'
import { MOODS } from '../../hooks/useMood'
import { format, subDays } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

const BAR_COLORS = {
  5: 'bg-emerald-400',
  4: 'bg-forest-400',
  3: 'bg-amber-300',
  2: 'bg-orange-400',
  1: 'bg-red-400',
}

export default function MoodChart({ mood }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d   = subDays(new Date(), 6 - i)
    const key = getDateKey(d)
    const entry = mood.getMoodForDate(key)
    return { date: d, key, entry }
  })

  const avg = mood.getAverageScore(7)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">7-Day Mood</p>
        <span className="text-sm font-semibold text-forest-500">Avg {avg}/5</span>
      </div>

      <div className="flex items-end gap-1.5 h-16">
        {days.map(({ date, key, entry }) => {
          const h = entry ? `${(entry.score / 5) * 100}%` : '8px'
          const emoji = entry ? MOODS.find(m => m.score === entry.score)?.emoji : null
          return (
            <div key={key} className="flex-1 flex flex-col items-center gap-1">
              {emoji && <span className="text-xs leading-none">{emoji}</span>}
              <div
                className={`w-full rounded-t-md transition-all ${entry ? (BAR_COLORS[entry.score] ?? 'bg-stone-200') : 'bg-stone-100'}`}
                style={{ height: h, minHeight: '8px' }}
                title={entry ? `${MOODS.find(m => m.score === entry.score)?.label} · ${entry.note}` : 'No entry'}
              />
              <span className="text-[9px] text-ink-faint">
                {format(date, 'EEE')[0]}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
