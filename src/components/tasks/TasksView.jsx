// Component: TasksView
// Purpose: Full tasks tab with filter, add modal, and task list grouped by status
import { useState } from 'react'
import Button        from '../ui/Card'
import Card          from '../ui/Card'
import Badge         from '../ui/Badge'
import Modal         from '../ui/Modal'
import TaskForm      from './TaskForm'
import { getTodayKey } from '../../utils/dateUtils'

const FILTERS = ['All', 'Today', 'Pending', 'Done']

export default function TasksView({ tasks }) {
  const [filter,  setFilter]  = useState('All')
  const [modalOpen, setModal] = useState(false)

  const todayKey = getTodayKey()

  const filtered = tasks.tasks.filter(t => {
    if (filter === 'Today')   return t.date === todayKey
    if (filter === 'Pending') return !t.completed
    if (filter === 'Done')    return t.completed
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const p = { high: 0, medium: 1, low: 2 }
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1)
  })

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{tasks.tasks.length} total tasks</p>
        <button
          onClick={() => setModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all ${
              filter === f ? 'bg-ink text-white' : 'bg-white border border-stone-200 text-ink-muted hover:border-stone-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <Card noPad>
        {sorted.length === 0 ? (
          <div className="py-16 text-center text-sm text-ink-faint italic">No tasks here yet</div>
        ) : (
          <ul className="divide-y divide-stone-50">
            {sorted.map(t => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50/50 transition-colors group">
                <button
                  onClick={() => tasks.toggleTask(t.id)}
                  className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all ${
                    t.completed ? 'bg-forest-500 border-forest-500 text-white' : 'border-stone-300 hover:border-forest-400'
                  }`}
                >
                  {t.completed && '✓'}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${t.completed ? 'line-through text-ink-faint' : 'text-ink'}`}>
                    {t.title}
                  </p>
                  <p className="text-[11px] text-ink-faint mt-0.5">{t.category} · {t.date}</p>
                </div>
                <Badge label={t.priority} color={t.priority} />
                <button
                  onClick={() => tasks.deleteTask(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-400 transition-all text-xs p-1 ml-1"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Add task modal */}
      <Modal isOpen={modalOpen} onClose={() => setModal(false)} title="New Task">
        <TaskForm onSubmit={(t) => { tasks.addTask(t); setModal(false) }} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  )
}
