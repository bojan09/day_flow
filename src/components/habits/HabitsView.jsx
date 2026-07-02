import ViewSkeleton from '../ui/ViewSkeleton'
import { useToast } from '../../utils/toast'
// Component: HabitsView
// Purpose: Habits tab — weekly/calendar toggle, rules panel, pairing suggestions, confetti
import { useState, useCallback, useRef } from 'react'
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
  const { toast } = useToast()
  const [modalOpen, setModal]    = useState(false)
  const [confetti,  setConfetti] = useState(false)
  const [view,      setView]     = useState('week')
  const prevStreaks               = useRef({})
  const weekDays                 = getWeekDays()
  const { habits: list, isHabitDone, toggleHabitDay, addHabit, updateHabit, deleteHabit, getStreak, getWeeklyCount } = habits

  const handleToggle = useCallback((habitId, dateKey) => {
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
  }, [toggleHabitDay, getStreak, habitRules, notifications])


  if (!habits.synced) return <ViewSkeleton type="habits" />
  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-2">
      <Confetti trigger={confetti} />

      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{list.length} habit{list.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <div className="flex rounded-full p-0.5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {['week','calendar'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all capitalize"
                style={view === v
                  ? { backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)', color: 'var(--text)' }
                  : { color: 'var(--text-faint)' }
                }>
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => setModal(true)}
            className="px-4 py-2 rounded-full [background-color:var(--accent)] text-white text-sm font-medium hover:[background-color:var(--accent)] transition-colors">
            + Add
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <HabitCalendar habits={habits} />
      ) : (
        <Card noPad>
          <div className="overflow-x-auto">
          <div
            className="grid items-center px-3 sm:px-5 py-3 border-b"
            style={{ gridTemplateColumns: 'var(--habit-label-col, 124px) repeat(7, minmax(1.75rem,1fr))', gap: '0.25rem', borderColor: 'var(--border-soft)' }}
          >
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Habit</span>
            {weekDays.map(d => (
              <span
                key={d.toISOString()}
                className="text-[10px] font-medium uppercase mx-auto text-center"
                style={{ color: isToday(d) ? 'var(--accent)' : 'var(--text-faint)' }}
              >
                {format(d, 'EEE')[0]}
              </span>
            ))}
          </div>
          {list.length === 0 ? (
            <EmptyState type="habits" title="No habits yet" subtitle="Build a routine — add your first habit." action="+ Add Habit" onAction={() => setModal(true)} />
          ) : (
            <div className="divide-y" style={{borderColor: "var(--border-soft)"}}>
              {list.map(h => (
                <HabitRow key={h.id} habit={h} weekDays={weekDays}
                  isHabitDone={isHabitDone} toggleHabitDay={handleToggle}
                  streak={getStreak(h.id)} weeklyCount={getWeeklyCount(h.id)}
                  onDelete={(id) => { const hb = list.find(x => x.id === id); deleteHabit(id); if (hb) toast.undo('Habit deleted', () => habits.restoreHabit(hb)) }} onEdit={updateHabit} />
              ))}
            </div>
          )}
          </div>
        </Card>
      )}

      {list.length >= 2 && <HabitRulesPanel habits={habits} habitRules={habitRules} />}

      <AddHabitModal isOpen={modalOpen} onClose={() => setModal(false)}
        onAdd={h => { habits.addHabit(h); setModal(false) }} />
    </div>
  )
}
