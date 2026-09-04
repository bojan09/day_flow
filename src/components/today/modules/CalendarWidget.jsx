// Component: CalendarWidget
// Purpose: Mini Today dashboard card — shows upcoming timeblock entries for today.
import { memo } from 'react'
import { getTodayKey } from '../../../utils/dateUtils'


function CalendarWidget({ timeblocks, onTabChange }) {
  const today    = getTodayKey()
  const entries  = (timeblocks?.getEntriesForDate?.(today) || [])
    .filter(e => e.text?.trim())
    .slice(0, 5)

  const now     = new Date()
  const nowHour = now.getHours()

  if (entries.length === 0) return (
    <div className="px-4 py-3 text-center">
      <p className="text-sm italic" style={{ color: 'var(--text-faint)' }}>
        No scheduled entries for today
      </p>
      <button type="button" onClick={() => onTabChange?.('timeblock')}
        className="mt-2 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
        Open schedule →
      </button>
    </div>
  )

  return (
    <div className="space-y-1.5 px-4 pb-3">
      {entries.map((entry, i) => {
        const isPast  = entry.hour < nowHour
        const isCurrent = entry.hour === nowHour
        return (
          <button type="button" key={i}
            onClick={() => onTabChange?.('timeblock')}
            className="w-full flex items-center gap-3 text-left py-1"
          >
            <span className="text-xs w-10 flex-shrink-0 font-medium"
              style={{ color: isPast ? 'var(--text-faint)' : isCurrent ? 'var(--accent)' : 'var(--text-muted)' }}>
              {String(entry.hour).padStart(2, '0')}:00
            </span>
            {isCurrent && (
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
                style={{ backgroundColor: 'var(--accent)' }} />
            )}
            <span className="text-sm truncate"
              style={{ color: isPast ? 'var(--text-faint)' : 'var(--text)',
                textDecoration: isPast ? 'line-through' : 'none' }}>
              {entry.text}
            </span>
          </button>
        )
      })}
      <button type="button" onClick={() => onTabChange?.('timeblock')}
        className="text-xs font-medium pt-1" style={{ color: 'var(--accent)' }}>
        Open schedule →
      </button>
    </div>
  )
}

export default memo(CalendarWidget)
