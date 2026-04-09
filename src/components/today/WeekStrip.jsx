// Component: WeekStrip
// Purpose: Polished 7-day week navigator with theme-aware active/today states
import { format, isToday, isSameDay } from 'date-fns'
import { getWeekDays } from '../../utils/dateUtils'
import { useState } from 'react'

export default function WeekStrip() {
  const days     = getWeekDays()
  const [sel, setSel] = useState(new Date())

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
      {days.map(day => {
        const active = isSameDay(day, sel)
        const today  = isToday(day)
        return (
          <button
            key={day.toISOString()}
            onClick={() => setSel(day)}
            className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl flex-shrink-0 transition-all duration-200 no-select"
            style={active
              ? { backgroundColor: 'var(--accent)', color: 'white', boxShadow: 'var(--shadow-card)' }
              : today
              ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent)', border: `1px solid var(--accent-mid)` }
              : { backgroundColor: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
            }
          >
            <span className="text-[10px] uppercase tracking-wider font-medium opacity-70">
              {format(day, 'EEE')}
            </span>
            <span className="text-base font-semibold leading-none">{format(day, 'd')}</span>
          </button>
        )
      })}
    </div>
  )
}
