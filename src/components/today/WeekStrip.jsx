// Component: WeekStrip
// Purpose: Horizontal scrollable strip showing Mon–Sun with today highlighted
import { format, isToday, isSameDay } from 'date-fns'
import { getWeekDays } from '../../utils/dateUtils'
import { useState } from 'react'

export default function WeekStrip() {
  const days = getWeekDays()
  const [selected, setSelected] = useState(new Date())

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
      {days.map(day => {
        const active = isSameDay(day, selected)
        const today  = isToday(day)
        return (
          <button
            key={day.toISOString()}
            onClick={() => setSelected(day)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl flex-shrink-0 transition-all ${
              active
                ? 'bg-forest-500 text-white shadow-sm'
                : today
                ? 'bg-forest-50 text-forest-700 border border-forest-200'
                : 'bg-white text-ink-muted border border-stone-100 hover:bg-stone-50'
            }`}
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
