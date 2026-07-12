import ViewSkeleton from '../ui/ViewSkeleton'
import { useToast } from '../../utils/toast'
// Component: HabitsView
// Purpose: Habits tab — weekly/calendar toggle, rules panel, pairing suggestions, confetti
import { useState, useCallback, useRef } from 'react'
import Card              from '../ui/Card'
import HabitCard          from './HabitCard'
import AddHabitModal     from './AddHabitModal'
import { EditHabitModal } from './HabitRow'
import HabitCalendar     from './HabitCalendar'
import HabitRulesPanel   from './HabitRulesPanel'
import Confetti          from '../ui/Confetti'
import EmptyState        from '../ui/EmptyState'
import { getWeekDays, getDateKey, getTodayKey } from '../../utils/dateUtils'
import { isFuture } from 'date-fns'
import { notifications } from '../../services/notificationService'

const MILESTONE_STREAKS = [7, 14, 30, 60, 100]

export default function HabitsView({ habits, habitRules }) {
  const { toast } = useToast()
  const [modalOpen, setModal]    = useState(false)
  const [confetti,  setConfetti] = useState(false)
  const [view,      setView]     = useState('week')
  const [editingHabit, setEditingHabit] = useState(null)
  const prevStreaks               = useRef({})
  const weekDays                 = getWeekDays()
  const { habits: list, isHabitDone, toggleHabitDay, updateHabit, deleteHabit, getStreak, getWeeklyCount } = habits

  const handleDelete = useCallback((habitId) => {
    const h = list.find(x => x.id === habitId)
    deleteHabit(habitId)
    if (h) toast.undo('Habit deleted', () => habits.restoreHabit(h))
  }, [list, deleteHabit, habits, toast])

  const handleEdit = useCallback((habitId) => {
    const h = list.find(x => x.id === habitId)
    if (h) setEditingHabit(h)
  }, [list])

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

      <div className="flex items-center justify-between gap-2 flex-wrap">
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
      ) : list.length === 0 ? (
        <Card noPad>
          <EmptyState type="habits" title="No habits yet" subtitle="Build a routine — add your first habit." action="+ Add Habit" onAction={() => setModal(true)} />
        </Card>
      ) : (
        <div className="space-y-2">
          {list.map(h => (
            <HabitCard
              key={h.id}
              habit={h}
              doneToday={isHabitDone(h.id)}
              last7={weekDays.map(d => isFuture(d) ? null : isHabitDone(h.id, getDateKey(d)))}
              onToggleToday={(habitId) => handleToggle(habitId, getTodayKey())}
              streak={getStreak(h.id)}
              frequencyLabel={h.frequency === 'daily' ? 'daily' : `${getWeeklyCount(h.id)}/${h.frequency}× wk`}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {list.length >= 2 && <HabitRulesPanel habits={habits} habitRules={habitRules} />}

      <AddHabitModal isOpen={modalOpen} onClose={() => setModal(false)}
        onAdd={h => { habits.addHabit(h); setModal(false) }} />

      {editingHabit && (
        <EditHabitModal
          habit={editingHabit}
          onSave={(updates) => updateHabit(editingHabit.id, updates)}
          onClose={() => setEditingHabit(null)}
        />
      )}
    </div>
  )
}
