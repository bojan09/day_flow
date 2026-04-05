// Component: TasksView
// Purpose: Full tasks tab — filter pills, task list with overdue/due-today badges, add modal
import { useState } from 'react'
import Card      from '../ui/Card'
import Badge     from '../ui/Badge'
import Modal     from '../ui/Modal'
import TaskForm  from './TaskForm'
import EmptyState from '../ui/EmptyState'
import { getTodayKey } from '../../utils/dateUtils'

const FILTERS = ['All', 'Today', 'Overdue', 'Pending', 'Done']

export default function TasksView({ tasks }) {
  const [filter,    setFilter] = useState('All')
  const [modalOpen, setModal]  = useState(false)
  const todayKey = getTodayKey()

  const filtered = tasks.tasks.filter(t => {
    if (filter === 'Today')   return t.date === todayKey
    if (filter === 'Overdue') return tasks.isOverdue(t)
    if (filter === 'Pending') return !t.completed
    if (filter === 'Done')    return t.completed
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const p = { high: 0, medium: 1, low: 2 }
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1)
  })

  const overdueCount = tasks.tasks.filter(t => tasks.isOverdue(t)).length

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {tasks.tasks.length} tasks
          {overdueCount > 0 && <span className="ml-2 text-red-500 font-medium">· {overdueCount} overdue</span>}
        </p>
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all ${
              filter === f ? 'bg-ink text-white' : 'bg-white border border-stone-200 text-ink-muted hover:border-stone-300'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <Card noPad>
        {sorted.length === 0 ? (
          <EmptyState type="tasks" title="Nothing here" subtitle="Add a task or change your filter." action="+ New Task" onAction={() => setModal(true)} />
        ) : (
          <ul className="divide-y divide-stone-50">
            {sorted.map(t => {
              const overdue  = tasks.isOverdue(t)
              const dueToday = tasks.isDueToday(t)
              return (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/50 transition-colors group">
                  {/* Checkbox */}
                  <button onClick={() => tasks.toggleTask(t.id)}
                    className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all ${
                      t.completed ? 'bg-forest-500 border-forest-500 text-white' : 'border-stone-300 hover:border-forest-400'
                    }`}>
                    {t.completed && '✓'}
                  </button>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${t.completed ? 'line-through text-ink-faint' : 'text-ink'}`}>{t.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-ink-faint">{t.category}</span>
                      {overdue  && <span className="text-[11px] font-medium text-red-500 bg-red-50 px-1.5 rounded">Overdue</span>}
                      {dueToday && <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-1.5 rounded">Due today</span>}
                      {t.estimateMins && <span className="text-[11px] text-ink-faint">⏱ {t.estimateMins < 60 ? `${t.estimateMins}m` : `${t.estimateMins/60}h`}</span>}
                      {t.isRecurring  && <span className="text-[11px] text-forest-500">🔁</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge label={t.priority} color={t.priority} />
                    {/* Focus pin */}
                    <button
                      onClick={() => tasks.setFocus(t.id)}
                      title={t.isFocus ? 'Unpin focus' : 'Set as focus task'}
                      className={`opacity-0 group-hover:opacity-100 text-sm transition-all p-1 rounded ${t.isFocus ? 'opacity-100 text-forest-500' : 'text-ink-faint hover:text-forest-500'}`}
                    >
                      {t.isFocus ? '📌' : '📍'}
                    </button>
                    <button onClick={() => tasks.deleteTask(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-400 transition-all text-xs p-1">
                      ✕
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModal(false)} title="New Task">
        <TaskForm onSubmit={t => { tasks.addTask(t); setModal(false) }} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  )
}
