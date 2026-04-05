// Component: HabitsView
// Purpose: Full habits tab — weekly grid, frequency labels, streak, confetti on milestones
import { useState, useEffect, useRef } from 'react'
import Card         from '../ui/Card'
import HabitRow     from './HabitRow'
import AddHabitModal from './AddHabitModal'
import Confetti     from '../ui/Confetti'
import EmptyState   from '../ui/EmptyState'
import { getWeekDays } from '../../utils/dateUtils'
import { format, isToday } from 'date-fns'
import { notifications } from '../../services/notificationService'

const MILESTONE_STREAKS = [7, 14, 30, 60, 100]

export default function HabitsView({ habits }) {
  const [modalOpen,   setModal]   = useState(false)
  const [confetti,    setConfetti] = useState(false)
  const prevStreaks                = useRef({})
  const weekDays                   = getWeekDays()
  const { habits: list, isHabitDone, toggleHabitDay, deleteHabit, getStreak, getWeeklyCount } = habits

  // Fire confetti when any streak hits a milestone
  const handleToggle = (habitId, dateKey) => {
    toggleHabitDay(habitId, dateKey)
    // Check after state settles
    setTimeout(() => {
      const newStreak = getStreak(habitId)
      const prev      = prevStreaks.current[habitId] || 0
      if (MILESTONE_STREAKS.includes(newStreak) && newStreak > prev) {
        setConfetti(true)
        setTimeout(() => setConfetti(false), 100)
        notifications.sendStreakCelebration(newStreak)
      }
      prevStreaks.current[habitId] = newStreak
    }, 50)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-2">
      <Confetti trigger={confetti} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{list.length} habit{list.length !== 1 ? 's' : ''} tracked</p>
        <button onClick={() => setModal(true)}
          className="px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors">
          + Add Habit
        </button>
      </div>

      <Card noPad>
        {/* Day headers */}
        <div className="grid items-center border-b border-stone-50 px-5 py-3"
          style={{ gridTemplateColumns: '1fr repeat(7, 2rem)' }}>
          <span className="text-xs text-ink-faint uppercase tracking-wider">Habit</span>
          {weekDays.map(d => (
            <span key={d.toISOString()}
              className={`text-center text-[10px] font-medium uppercase tracking-wide ${isToday(d) ? 'text-forest-500' : 'text-ink-faint'}`}>
              {format(d, 'EEE')[0]}
            </span>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState type="habits" title="No habits yet" subtitle="Build a routine — add your first habit to start tracking." action="+ Add Habit" onAction={() => setModal(true)} />
        ) : (
          <div className="divide-y divide-stone-50">
            {list.map(h => (
              <HabitRow key={h.id} habit={h} weekDays={weekDays}
                isHabitDone={isHabitDone} toggleHabitDay={handleToggle}
                streak={getStreak(h.id)} weeklyCount={getWeeklyCount(h.id)}
                onDelete={deleteHabit} />
            ))}
          </div>
        )}
      </Card>

      <AddHabitModal isOpen={modalOpen} onClose={() => setModal(false)}
        onAdd={h => { habits.addHabit(h); setModal(false) }} />
    </div>
  )
}
