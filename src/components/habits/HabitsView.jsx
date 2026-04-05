// Component: HabitsView
// Purpose: Full habits tab — weekly grid, streak display, and add habit form
import { useState } from 'react'
import Card      from '../ui/Card'
import HabitRow  from './HabitRow'
import AddHabitModal from './AddHabitModal'
import { getWeekDays } from '../../utils/dateUtils'
import { format, isToday } from 'date-fns'

export default function HabitsView({ habits }) {
  const [modalOpen, setModal] = useState(false)
  const weekDays = getWeekDays()
  const { habits: list, isHabitDone, toggleHabitDay, deleteHabit, getStreak } = habits

  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{list.length} habits tracked</p>
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors"
        >
          + Add Habit
        </button>
      </div>

      {/* Weekly grid */}
      <Card noPad>
        {/* Day headers */}
        <div className="grid items-center border-b border-stone-50 px-5 py-3"
             style={{ gridTemplateColumns: '1fr repeat(7, 2rem)' }}>
          <span className="text-xs text-ink-faint uppercase tracking-wider">Habit</span>
          {weekDays.map(d => (
            <span
              key={d.toISOString()}
              className={`text-center text-[10px] font-medium uppercase tracking-wide ${isToday(d) ? 'text-forest-500' : 'text-ink-faint'}`}
            >
              {format(d, 'EEE')[0]}
            </span>
          ))}
        </div>

        {/* Habit rows */}
        {list.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-sm text-ink-faint italic">Add your first habit to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {list.map(h => (
              <HabitRow
                key={h.id}
                habit={h}
                weekDays={weekDays}
                isHabitDone={isHabitDone}
                toggleHabitDay={toggleHabitDay}
                streak={getStreak(h.id)}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        )}
      </Card>

      <AddHabitModal
        isOpen={modalOpen}
        onClose={() => setModal(false)}
        onAdd={(h) => { habits.addHabit(h); setModal(false) }}
      />
    </div>
  )
}
