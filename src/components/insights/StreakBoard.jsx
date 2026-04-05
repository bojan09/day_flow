// Component: StreakBoard
// Purpose: Shows streak count and 28-day completion grid for each habit
import Card from '../ui/Card'
import { getDateKey } from '../../utils/dateUtils'
import { subDays } from 'date-fns'

export default function StreakBoard({ habits }) {
  const { habits: list, log, getStreak } = habits
  // Build last 28 days array
  const days28 = Array.from({ length: 28 }, (_, i) =>
    getDateKey(subDays(new Date(), 27 - i))
  )

  if (list.length === 0) return null

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-4">Habit Streaks</p>
      <div className="space-y-4">
        {list.map(h => {
          const streak = getStreak(h.id)
          return (
            <div key={h.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{h.icon}</span>
                  <span className="text-sm font-medium text-ink">{h.name}</span>
                </div>
                <span className={`text-sm font-semibold ${streak >= 7 ? 'text-terracotta-500' : 'text-ink-muted'}`}>
                  {streak > 0 ? `${streak}🔥` : '—'}
                </span>
              </div>
              {/* 28-day dot grid */}
              <div className="flex gap-0.5 flex-wrap">
                {days28.map(dateKey => {
                  const done = !!log[`${h.id}_${dateKey}`]
                  return (
                    <div
                      key={dateKey}
                      title={dateKey}
                      className={`w-3 h-3 rounded-sm ${done ? 'bg-forest-500' : 'bg-stone-100'}`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
