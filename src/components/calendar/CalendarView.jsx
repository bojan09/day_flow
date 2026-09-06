// Component: CalendarView
// Purpose: Monthly calendar showing tasks per day with color category dots and day detail
import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'
import Card from '../ui/Card'
import Modal from '../ui/Modal'
import TaskForm from '../tasks/TaskForm'
import DayDetailPanel from './DayDetailPanel'

const CAT_DOT = {
  Work: '[background-color:var(--tone-blue-text)]', Personal: '[background-color:var(--accent)]', Health: '[background-color:var(--tone-emerald-text)]',
  Learning: '[background-color:var(--tone-violet-text)]', Finance: '[background-color:var(--tone-amber-text)]', Other: '[background-color:var(--border)]',
}


export default function CalendarView({ tasks, categories, onAddCategory, onRemoveCategory }) {
  const [month,       setMonth]       = useState(new Date())
  // selectedDay: null means "no explicit selection" — the day detail panel
  // falls back to today (effectiveDay below) so it always has content to show.
  const [selectedDay, setSelectedDay] = useState(null)
  const [addModal,    setAddModal]    = useState(false)

  const monthStart = startOfMonth(month)
  const monthEnd   = endOfMonth(month)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow   = (getDay(monthStart) + 6) % 7
  const padded     = [...Array(startDow).fill(null), ...days]

  const prevMonth  = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const nextMonth  = () => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))

  const getDayTasks = (day) => tasks.tasks.filter(t => t.date === getDateKey(day))

  // Day shown in the DayDetailPanel: the explicitly selected day, or today by default.
  const effectiveDay   = selectedDay || new Date()
  const effectiveTasks = tasks.getTasksByDate
    ? tasks.getTasksByDate(getDateKey(effectiveDay))
    : getDayTasks(effectiveDay)

  // No task-detail/edit view exists yet in this app; clicking a task in the
  // panel is a no-op placeholder until one is added.
  const handleOpenTask = () => {}

  return (
    <div className="max-w-2xl mx-auto pt-2 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
      <Card noPad>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b [border-color:var(--border-soft)]">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:[background-color:var(--bg-secondary)] flex items-center justify-center [color:var(--text-muted)] transition-colors">‹</button>
          <span className="font-serif text-lg [color:var(--text)]">{format(month, 'MMMM yyyy')}</span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:[background-color:var(--bg-secondary)] flex items-center justify-center [color:var(--text-muted)] transition-colors">›</button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 px-3 pt-3 pb-1">
          {['M','T','W','T','F','S','S'].map((d,i) => (
            <div key={i} className="text-center text-[11px] font-medium [color:var(--text-faint)] uppercase">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-0.5 px-3 pb-4">
          {padded.map((day, i) => {
            if (!day) return <div key={`p${i}`} />
            const dayTasks = getDayTasks(day)
            const active   = isToday(day)
            const selected = selectedDay && isSameDay(day, selectedDay)
            const cats     = [...new Set(dayTasks.map(t => t.category))].slice(0, 3)
            return (
              <button key={getDateKey(day)} onClick={() => setSelectedDay(isSameDay(day, selectedDay) ? null : day)}
                className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${
                  selected ? '[background-color:var(--accent)] text-white' :
                  active   ? '[background-color:var(--accent-light)] border [border-color:var(--accent-mid)]' :
                             'hover:[background-color:var(--bg-secondary)]'
                }`}>
                <span className={`text-sm font-medium ${selected ? 'text-white' : active ? '[color:var(--accent-text)]' : '[color:var(--text)]'}`}>
                  {format(day, 'd')}
                </span>
                {/* Category dots */}
                <div className="flex gap-0.5 mt-0.5 h-2 items-center">
                  {cats.map((cat, ci) => (
                    <div key={ci} className={`w-1.5 h-1.5 rounded-full ${selected ? '[background-color:var(--surface)]/70' : (CAT_DOT[cat] || '[background-color:var(--border)]')}`} />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className={`text-[8px] ${selected ? 'text-white/70' : '[color:var(--text-faint)]'}`}>+</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {Object.entries(CAT_DOT).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[10px] [color:var(--text-faint)]">{cat}</span>
            </div>
          ))}
        </div>
      </Card>
      </div>

      {/* Day detail side panel — desktop: side-by-side, mobile: stacked below grid */}
      <div className="md:w-72 flex-shrink-0 space-y-3">
        <button onClick={() => setAddModal(true)}
          className="w-full text-xs px-3 py-1.5 rounded-full [background-color:var(--accent)] text-white font-medium hover:[background-color:var(--accent)] transition-colors">
          + Task
        </button>
        <DayDetailPanel
          date={format(effectiveDay, 'EEEE, MMMM d')}
          dayTasks={effectiveTasks}
          onToggleTask={tasks.toggleTask}
          onOpenTask={handleOpenTask}
        />
      </div>
      </div>

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="New Task" fullScreenOnMobile>
        <TaskForm
          onSubmit={t => { tasks.addTask({ ...t, date: getDateKey(effectiveDay) }); setAddModal(false) }}
          categories={categories || ['Work','Personal','Health','Learning','Finance','Other']}
          onAddCategory={onAddCategory}
          onRemoveCategory={onRemoveCategory}
          onCancel={() => setAddModal(false)}
        />
      </Modal>
    </div>
  )
}
