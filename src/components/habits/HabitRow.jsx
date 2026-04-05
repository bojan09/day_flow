// Component: HabitRow
// Purpose: Single habit row — icon, name, frequency badge, 7-day toggle circles, streak, delete
import { getDateKey } from '../../utils/dateUtils'
import { isToday } from 'date-fns'

export default function HabitRow({ habit, weekDays, isHabitDone, toggleHabitDay, streak, weeklyCount, onDelete }) {
  const freqLabel = habit.frequency === 'daily'
    ? 'daily'
    : `${weeklyCount}/${habit.frequency}× wk`

  return (
    <div className="group grid items-center gap-2 px-5 py-3 hover:bg-stone-50/60 transition-colors"
      style={{ gridTemplateColumns: '1fr repeat(7, 2rem)' }}>
      <div className="flex items-center gap-2 min-w-0 pr-1">
        <span className="text-lg flex-shrink-0">{habit.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink font-medium truncate">{habit.name}</p>
          <div className="flex items-center gap-2">
            {streak > 0 && <p className="text-[10px] text-terracotta-500">{streak}🔥</p>}
            <p className="text-[10px] text-ink-faint">{freqLabel}</p>
          </div>
        </div>
        <button onClick={() => onDelete(habit.id)}
          className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-400 text-xs transition-all p-1 flex-shrink-0">
          ✕
        </button>
      </div>

      {weekDays.map(day => {
        const dateKey = getDateKey(day)
        const done    = isHabitDone(habit.id, dateKey)
        const today   = isToday(day)
        return (
          <button key={dateKey} onClick={() => toggleHabitDay(habit.id, dateKey)}
            className={`w-7 h-7 mx-auto rounded-full border-2 flex items-center justify-center text-[10px] transition-all ${
              done  ? 'bg-forest-500 border-forest-500 text-white' :
              today ? 'border-forest-300 hover:bg-forest-50' :
                      'border-stone-200 hover:border-stone-300'
            }`}>
            {done && '✓'}
          </button>
        )
      })}
    </div>
  )
}
