// Component: TodayTaskList
// Purpose: Today's tasks with animated checkboxes, overdue badge, theme-aware surfaces
import { useState } from 'react'
import EmptyState from '../ui/EmptyState'

export default function TodayTaskList({ tasks }) {
  const [newTitle, setNewTitle] = useState('')
  const todayTasks = tasks.getTodayTasks()

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    tasks.addTask({ title: newTitle })
    setNewTitle('')
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div
        className="px-5 pt-4 pb-3 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <h3 className="font-serif text-base" style={{ color: 'var(--text)' }}>Today's Tasks</h3>
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
          {todayTasks.filter(t => t.completed).length}/{todayTasks.length}
        </span>
      </div>

      {todayTasks.length === 0 ? (
        <EmptyState type="tasks" title="No tasks today" subtitle="Add something to get started." />
      ) : (
        <ul className="divide-y max-h-72 overflow-y-auto scrollbar-hide"
          style={{ borderColor: 'var(--border-soft)' }}>
          {todayTasks.map(t => (
            <li
              key={t.id}
              className="flex items-center gap-3 px-5 py-3 group transition-colors"
              style={{ '--hover-bg': 'var(--bg-secondary)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {/* Animated checkbox */}
              <button
                onClick={() => tasks.toggleTask(t.id)}
                className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all duration-200 ${
                  t.completed
                    ? 'text-white animate-bounce-check'
                    : 'hover:border-forest-400'
                }`}
                style={t.completed
                  ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }
                  : { borderColor: 'var(--border)' }
                }
              >
                {t.completed && '✓'}
              </button>

              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm block truncate transition-all ${t.completed ? 'line-through' : ''}`}
                  style={{ color: t.completed ? 'var(--text-faint)' : 'var(--text)' }}
                >
                  {t.title}
                </span>
                {tasks.isOverdue(t) && (
                  <span className="text-[10px] text-red-500 font-medium">Overdue</span>
                )}
              </div>

              <button
                onClick={() => tasks.deleteTask(t.id)}
                className="opacity-0 group-hover:opacity-100 text-xs p-1 transition-all"
                style={{ color: 'var(--text-faint)' }}
                onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-faint)'}
              >✕</button>
            </li>
          ))}
        </ul>
      )}

      {/* Quick-add */}
      <form
        onSubmit={handleAdd}
        className="px-5 py-3 flex gap-2 border-t"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a task for today…"
          className="flex-1 text-sm bg-transparent outline-none"
          style={{ color: 'var(--text)', caretColor: 'var(--accent)' }}
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="text-sm font-medium transition-colors disabled:opacity-30"
          style={{ color: 'var(--accent)' }}
        >
          Add
        </button>
      </form>
    </div>
  )
}
