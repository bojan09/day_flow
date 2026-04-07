// Component: HabitsView
// Purpose: Habits tab — weekly/calendar toggle, rules panel, pairing suggestions, confetti
import { useState, useRef } from 'react'
import Card              from '../ui/Card'
import HabitRow          from './HabitRow'
import AddHabitModal     from './AddHabitModal'
import HabitCalendar     from './HabitCalendar'
import HabitRulesPanel   from './HabitRulesPanel'
import Confetti          from '../ui/Confetti'
import EmptyState        from '../ui/EmptyState'
import { getWeekDays }   from '../../utils/dateUtils'
import { format, isToday } from 'date-fns'
import { notifications } from '../../services/notificationService'

const MILESTONE_STREAKS = [7, 14, 30, 60, 100]

export default function HabitsView({ habits, habitRules }) {
  const [modalOpen, setModal]    = useState(false)
  const [confetti,  setConfetti] = useState(false)
  const [view,      setView]     = useState('week')
  const prevStreaks               = useRef({})
  const weekDays                 = getWeekDays()
  const { habits: list, isHabitDone, toggleHabitDay, deleteHabit, getStreak, getWeeklyCount } = habits

  const handleToggle = (habitId, dateKey) => {
    // Fire IFTTT rules
    habitRules.fireRules(habitId, toggleHabitDay)
    toggleHabitDay(habitId, dateKey)
    setTimeout(() => {
      const s = getStreak(habitId)
      if (MILESTONE_STREAKS.includes(s) && s > (prevStreaks.current[habitId] || 0)) {
        setConfetti(true); setTimeout(() => setConfetti(false), 100)
        notifications.sendStreakCelebration(s)
      }
      prevStreaks.current[habitId] = s
    }, 50)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-2">
      <Confetti trigger={confetti} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{list.length} habit{list.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <div className="flex bg-stone-100 rounded-full p-0.5">
            {['week','calendar'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${view === v ? 'bg-white shadow-sm text-ink' : 'text-ink-muted'}`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => setModal(true)}
            className="px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors">
            + Add
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <HabitCalendar habits={habits} />
      ) : (
        <Card noPad>
          <div className="grid items-center border-b border-stone-50 px-5 py-3"
            style={{ gridTemplateColumns: '1fr repeat(7, 2rem)' }}>
            <span className="text-xs text-ink-faint uppercase tracking-wider">Habit</span>
            {weekDays.map(d => (
              <span key={d.toISOString()}
                className={`text-center text-[10px] font-medium uppercase ${isToday(d) ? 'text-forest-500' : 'text-ink-faint'}`}>
                {format(d, 'EEE')[0]}
              </span>
            ))}
          </div>
          {list.length === 0 ? (
            <EmptyState type="habits" title="No habits yet" subtitle="Build a routine — add your first habit." action="+ Add Habit" onAction={() => setModal(true)} />
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
      )}

      {list.length >= 2 && <HabitRulesPanel habits={habits} habitRules={habitRules} />}

      <AddHabitModal isOpen={modalOpen} onClose={() => setModal(false)}
        onAdd={h => { habits.addHabit(h); setModal(false) }} />
    </div>
  )
}
