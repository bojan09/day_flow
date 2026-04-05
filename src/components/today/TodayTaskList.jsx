// Component: TodayTaskList
// Purpose: Today's tasks with toggle + quick-add, inside a card
import { useState } from 'react'
import Card   from '../ui/Card'
import Badge  from '../ui/Badge'

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
    <Card noPad>
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-stone-50">
        <h3 className="font-serif text-base text-ink">Today's Tasks</h3>
        <span className="text-xs text-ink-faint">{todayTasks.filter(t=>t.completed).length}/{todayTasks.length}</span>
      </div>

      {/* Task list */}
      <ul className="divide-y divide-stone-50 max-h-72 overflow-y-auto scrollbar-hide">
        {todayTasks.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-ink-faint italic">No tasks yet — add one below</li>
        )}
        {todayTasks.map(t => (
          <li key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50/60 transition-colors group">
            <button
              onClick={() => tasks.toggleTask(t.id)}
              className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all ${
                t.completed ? 'bg-forest-500 border-forest-500 text-white' : 'border-stone-300 hover:border-forest-400'
              }`}
            >
              {t.completed && '✓'}
            </button>
            <span className={`flex-1 text-sm min-w-0 truncate ${t.completed ? 'line-through text-ink-faint' : 'text-ink'}`}>
              {t.title}
            </span>
            <Badge
              label={t.priority}
              color={t.priority}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <button
              onClick={() => tasks.deleteTask(t.id)}
              className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-400 transition-all text-xs p-1"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* Quick-add */}
      <form onSubmit={handleAdd} className="px-5 py-3 border-t border-stone-50 flex gap-2">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 text-sm bg-transparent outline-none text-ink placeholder-ink-faint"
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="text-forest-500 font-medium text-sm hover:text-forest-700 disabled:opacity-30 transition-colors"
        >
          Add
        </button>
      </form>
    </Card>
  )
}
