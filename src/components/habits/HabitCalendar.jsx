// Component: HabitCalendar
// Purpose: Full-month calendar view for habits — shows completion dots per day
import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'
import Card from '../ui/Card'

export default function HabitCalendar({ habits }) {
  const [month,       setMonth]       = useState(new Date())
  const [selectedHabit, setSelected] = useState(null)

  const monthStart = startOfMonth(month)
  const monthEnd   = endOfMonth(month)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad to start on Monday (0=Mon)
  const startDow  = (getDay(monthStart) + 6) % 7
  const padded    = [...Array(startDow).fill(null), ...days]
  const habit     = habits.habits.find(h => h.id === selectedHabit) || habits.habits[0]

  const prevMonth = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const nextMonth = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))

  return (
    <Card>
      {/* Habit selector */}
      {habits.habits.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-4 pb-1">
          {habits.habits.map(h => (
            <button key={h.id} onClick={() => setSelected(h.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all border ${
                (selectedHabit || habits.habits[0]?.id) === h.id
                  ? '[background-color:var(--accent)] text-white [border-color:var(--accent)]'
                  : '[border-color:var(--border)] [color:var(--text-muted)] hover:[background-color:var(--bg-secondary)]'
              }`}>
              <span>{h.icon}</span>{h.name}
            </button>
          ))}
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth}
          className="w-7 h-7 rounded-full hover:[background-color:var(--bg-secondary)] flex items-center justify-center [color:var(--text-muted)] transition-colors text-sm">
          ‹
        </button>
        <span className="font-serif text-base [color:var(--text)]">{format(month, 'MMMM yyyy')}</span>
        <button onClick={nextMonth}
          className="w-7 h-7 rounded-full hover:[background-color:var(--bg-secondary)] flex items-center justify-center [color:var(--text-muted)] transition-colors text-sm">
          ›
        </button>
      </div>

      {/* Day of week headers */}
      <div className="grid grid-cols-7 mb-2">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium [color:var(--text-faint)] uppercase">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      {habit ? (
        <div className="grid grid-cols-7 gap-1">
          {padded.map((day, i) => {
            if (!day) return <div key={`pad-${i}`} />
            const dateKey = getDateKey(day)
            const done    = habits.isHabitDone(habit.id, dateKey)
            const today   = isToday(day)
            return (
              <button
                key={dateKey}
                onClick={() => habits.toggleHabitDay(habit.id, dateKey)}
                className={`aspect-square rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  done  ? '[background-color:var(--accent)] text-white shadow-sm'
                  : today ? 'border-2 [border-color:var(--accent-mid)] [color:var(--accent)] hover:[background-color:var(--accent-light)]'
                  : '[color:var(--text-muted)] hover:[background-color:var(--bg-secondary)]'
                }`}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-sm [color:var(--text-faint)] py-6 italic">Add habits to see the calendar</p>
      )}

      {/* Month summary */}
      {habit && (
        <div className="mt-4 pt-3 border-t [border-color:var(--border-soft)] flex justify-between text-xs [color:var(--text-faint)]">
          <span>
            {days.filter(d => habits.isHabitDone(habit.id, getDateKey(d))).length} / {days.length} days
          </span>
          <span className="[color:var(--accent)] font-medium">
            {Math.round((days.filter(d => habits.isHabitDone(habit.id, getDateKey(d))).length / days.length) * 100)}% this month
          </span>
        </div>
      )}
    </Card>
  )
}
