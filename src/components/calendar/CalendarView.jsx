// Component: CalendarView
// Purpose: Monthly calendar showing tasks per day with color category dots and day detail
import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'
import Card from '../ui/Card'
import Modal from '../ui/Modal'
import TaskForm from '../tasks/TaskForm'

const CAT_DOT = {
  Work: 'bg-blue-400', Personal: 'bg-forest-500', Health: 'bg-emerald-500',
  Learning: 'bg-violet-500', Finance: 'bg-amber-400', Other: 'bg-stone-400',
}

const LOAD_COLOR = (n) =>
  n === 0 ? '' : n <= 2 ? 'bg-forest-100' : n <= 4 ? 'bg-forest-200' : 'bg-forest-400'

export default function CalendarView({ tasks }) {
  const [month,       setMonth]       = useState(new Date())
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
  const selectedTasks = selectedDay ? getDayTasks(selectedDay) : []

  return (
    <div className="max-w-2xl mx-auto pt-2 space-y-4">
      <Card noPad>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-50">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-ink-muted transition-colors">‹</button>
          <span className="font-serif text-lg text-ink">{format(month, 'MMMM yyyy')}</span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-ink-muted transition-colors">›</button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 px-3 pt-3 pb-1">
          {['M','T','W','T','F','S','S'].map((d,i) => (
            <div key={i} className="text-center text-[11px] font-medium text-ink-faint uppercase">{d}</div>
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
                  selected ? 'bg-forest-500 text-white' :
                  active   ? 'bg-forest-50 border border-forest-300' :
                             'hover:bg-stone-50'
                }`}>
                <span className={`text-sm font-medium ${selected ? 'text-white' : active ? 'text-forest-600' : 'text-ink'}`}>
                  {format(day, 'd')}
                </span>
                {/* Category dots */}
                <div className="flex gap-0.5 mt-0.5 h-2 items-center">
                  {cats.map((cat, ci) => (
                    <div key={ci} className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-white/70' : (CAT_DOT[cat] || 'bg-stone-300')}`} />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className={`text-[8px] ${selected ? 'text-white/70' : 'text-ink-faint'}`}>+</span>
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
              <span className="text-[10px] text-ink-faint">{cat}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Day detail panel */}
      {selectedDay && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="font-serif text-base text-ink">{format(selectedDay, 'EEEE, MMMM d')}</span>
            <button onClick={() => setAddModal(true)}
              className="text-xs px-3 py-1.5 rounded-full bg-forest-500 text-white font-medium hover:bg-forest-700 transition-colors">
              + Task
            </button>
          </div>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-ink-faint italic">No tasks — tap + to add one.</p>
          ) : (
            <ul className="space-y-2">
              {selectedTasks.map(t => (
                <li key={t.id} className="flex items-center gap-2.5">
                  <button onClick={() => tasks.toggleTask(t.id)}
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-[9px] transition-all ${
                      t.completed ? 'bg-forest-500 border-forest-500 text-white' : 'border-stone-300 hover:border-forest-400'
                    }`}>{t.completed && '✓'}</button>
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CAT_DOT[t.category] || 'bg-stone-300'}`} />
                  <span className={`text-sm flex-1 truncate ${t.completed ? 'line-through text-ink-faint' : 'text-ink'}`}>
                    {t.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="New Task">
        <TaskForm
          onSubmit={t => { tasks.addTask({ ...t, date: selectedDay ? getDateKey(selectedDay) : undefined }); setAddModal(false) }}
          onCancel={() => setAddModal(false)}
        />
      </Modal>
    </div>
  )
}
