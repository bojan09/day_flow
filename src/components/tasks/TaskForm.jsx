// Component: TaskForm
// Purpose: Form inside the "New Task" modal — title, priority, category, date
import { useState } from 'react'
import Input  from '../ui/Input'
import { TASK_CATEGORIES } from '../../utils/constants'
import { getTodayKey } from '../../utils/dateUtils'

const PRIORITIES = ['low', 'medium', 'high']

export default function TaskForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title:    '',
    priority: 'medium',
    category: 'Personal',
    date:     getTodayKey(),
  })

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task title"
        placeholder="What needs to be done?"
        value={form.title}
        onChange={e => set('title', e.target.value)}
        autoFocus
      />

      {/* Priority */}
      <div>
        <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Priority</p>
        <div className="flex gap-2">
          {PRIORITIES.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => set('priority', p)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${
                form.priority === p
                  ? p === 'high'   ? 'bg-red-50 border-red-300 text-red-600'
                  : p === 'medium' ? 'bg-amber-50 border-amber-300 text-amber-600'
                                   : 'bg-forest-50 border-forest-300 text-forest-700'
                  : 'border-stone-200 text-ink-faint hover:bg-stone-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Category</p>
        <div className="flex flex-wrap gap-2">
          {TASK_CATEGORIES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('category', c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                form.category === c
                  ? 'bg-ink text-white border-ink'
                  : 'border-stone-200 text-ink-muted hover:bg-stone-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <Input
        label="Date"
        type="date"
        value={form.date}
        onChange={e => set('date', e.target.value)}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-ink-muted hover:bg-stone-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!form.title.trim()}
          className="flex-1 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-40 transition-colors"
        >
          Add Task
        </button>
      </div>
    </form>
  )
}
