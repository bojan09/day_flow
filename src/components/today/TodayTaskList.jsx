// Component: TodayTaskList
// Purpose: Today's tasks — 44px+ tap targets, swipe-friendly rows, quick-add.
import { memo, useState } from 'react'
import EmptyState from '../ui/EmptyState'

function TodayTaskList({ tasks }) {
  const [newTitle, setNewTitle] = useState('')
  const todayTasks = tasks.getTodayTasks()
  const doneCount  = todayTasks.filter(t => t.completed).length

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
      {/* Header */}
      <div
        className="px-5 pt-4 pb-3 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <h3 className="font-serif text-base" style={{ color: 'var(--text)' }}>Today's Tasks</h3>
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
          {doneCount}/{todayTasks.length}
        </span>
      </div>

      {todayTasks.length === 0 ? (
        <EmptyState type="tasks" title="No tasks today" subtitle="Add something to get started." />
      ) : (
        <ul className="divide-y max-h-80 overflow-y-auto scrollbar-hide"
          style={{ borderColor: 'var(--border-soft)' }}>
          {todayTasks.map(t => (
            <li
              key={t.id}
              className="hover-surface flex items-center gap-3 px-5 group transition-colors"
              style={{ minHeight: '52px' }}
            >
              {/* Checkbox — 44px tap target */}
              <button
                onClick={() => tasks.toggleTask(t.id)}
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center -ml-2"
                aria-label={t.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                <span
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs transition-all duration-200 ${t.completed ? 'animate-bounce-check' : ''}`}
                  style={t.completed
                    ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                    : { borderColor: 'var(--border)' }
                  }
                >
                  {t.completed && '✓'}
                </span>
              </button>

              <div className="flex-1 min-w-0 py-3">
                <span
                  className={`text-sm block truncate transition-all ${t.completed ? 'line-through' : ''}`}
                  style={{ color: t.completed ? 'var(--text-faint)' : 'var(--text)' }}
                >
                  {t.title}
                </span>
                {tasks.isOverdue(t) && !t.completed && (
                  <span className="text-[10px] font-medium" style={{ color: '#ef4444' }}>Overdue</span>
                )}
              </div>

              {/* Delete — 44px tap target */}
              <button
                onClick={() => tasks.deleteTask(t.id)}
                className="hover-danger w-11 h-11 flex-shrink-0 flex items-center justify-center -mr-2 opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: 'var(--text-faint)' }}
                aria-label="Delete task"
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
          className="flex-1 text-sm bg-transparent outline-none min-h-[44px]"
          style={{ color: 'var(--text)', caretColor: 'var(--accent)' }}
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="text-sm font-semibold transition-colors disabled:opacity-30 min-w-[44px] min-h-[44px]"
          style={{ color: 'var(--accent-text)' }}
        >Add</button>
      </form>
    </div>
  )
}

export default memo(TodayTaskList)
