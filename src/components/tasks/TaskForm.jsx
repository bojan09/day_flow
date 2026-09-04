// Component: TaskForm
// Purpose: New task form — title, priority, category (with custom), date, estimate, recurring, project
import { useState } from 'react'
import Input          from '../ui/Input'
import CategoryPicker from '../ui/CategoryPicker'
import { getTodayKey } from '../../utils/dateUtils'

const PRIORITIES = ['low', 'medium', 'high']
const RECUR_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const ESTIMATES  = [null, 15, 30, 45, 60, 90, 120]

const PRIORITY_STYLES = {
  high:   'bg-red-50 border-red-300 text-red-600',
  medium: 'bg-amber-50 border-amber-300 text-amber-600',
  low:    '[background-color:var(--accent-light)] [border-color:var(--accent-mid)] [color:var(--accent-text)]',
}

export default function TaskForm({
  onSubmit, onCancel, projects = [],
  categories, onAddCategory, onRemoveCategory,
}) {
  const [form, setForm] = useState({
    title: '', priority: 'medium', category: 'Personal',
    date: getTodayKey(), estimateMins: null,
    dueTime: '', customMins: '',
    isRecurring: false, recurDays: [], projectId: null,
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleDay = (day) =>
    set('recurDays', form.recurDays.includes(day)
      ? form.recurDays.filter(d => d !== day)
      : [...form.recurDays, day])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  const inputStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task title" placeholder="What needs to be done?"
        value={form.title} onChange={e => set('title', e.target.value)} autoFocus
      />

      {/* Priority */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
          Priority
        </p>
        <div className="flex gap-2">
          {PRIORITIES.map(p => (
            <button key={p} type="button" onClick={() => set('priority', p)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${
                form.priority === p ? PRIORITY_STYLES[p] : '[border-color:var(--border)] [color:var(--text-faint)] hover:[background-color:var(--bg-secondary)]'
              }`}
            >{p}</button>
          ))}
        </div>
      </div>

      {/* Category — uses CategoryPicker with custom support */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
          Category
        </p>
        <CategoryPicker
          value={form.category}
          onChange={v => set('category', v)}
          categories={categories}
          onAddCategory={onAddCategory}
          onRemoveCategory={onRemoveCategory}
        />
      </div>

      {/* Date + estimate */}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Date" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Est. time
          </p>
          <select
            value={form.estimateMins ?? ''}
            onChange={e => set('estimateMins', e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={inputStyle}
          >
            <option value="">None</option>
            {ESTIMATES.filter(Boolean).map(m => (
              <option key={m} value={m}>{m < 60 ? `${m} min` : `${m/60}h`}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Project link */}
      {projects.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Project
          </p>
          <select
            value={form.projectId || ''}
            onChange={e => set('projectId', e.target.value || null)}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={inputStyle}
          >
            <option value="">No project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* Due time + custom duration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="task-due-time" className="text-xs font-medium uppercase tracking-wide block mb-1.5"
            style={{ color: 'var(--text-muted)' }}>
            Due time
          </label>
          <input
            id="task-due-time"
            type="time"
            value={form.dueTime}
            onChange={e => set('dueTime', e.target.value)}
            className="input-base w-full"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="task-custom-duration" className="text-xs font-medium uppercase tracking-wide block mb-1.5"
            style={{ color: 'var(--text-muted)' }}>
            Custom duration
          </label>
          <input
            id="task-custom-duration"
            type="text"
            value={form.customMins}
            onChange={e => set('customMins', e.target.value)}
            placeholder="e.g. 25min, 1h30m"
            className="input-base w-full"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Recurring */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          {/* Real checkbox drives the state and is what keyboard/AT users interact
              with; it's visually hidden and the styled div below is purely
              decorative, kept in sync via form.isRecurring (unchanged visuals). */}
          <input
            type="checkbox"
            checked={form.isRecurring}
            onChange={e => set('isRecurring', e.target.checked)}
            className="peer sr-only"
          />
          <div
            aria-hidden="true"
            className={`w-9 h-5 rounded-full transition-colors relative peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 [--tw-ring-color:var(--accent)] ${form.isRecurring ? '[background-color:var(--accent)]' : '[background-color:var(--border)]'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 [background-color:var(--surface)] rounded-full shadow transition-transform ${form.isRecurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Recurring task</span>
        </label>
        {form.isRecurring && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {RECUR_DAYS.map(d => (
              <button key={d} type="button" onClick={() => toggleDay(d)}
                className={`w-10 h-8 rounded-lg text-xs font-medium transition-all ${
                  form.recurDays.includes(d) ? '[background-color:var(--accent)] text-white' : '[background-color:var(--bg-secondary)] [color:var(--text-muted)] hover:[background-color:var(--border)]'
                }`}>{d}</button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >Cancel</button>
        <button type="submit" disabled={!form.title.trim()}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)' }}
        >Add Task</button>
      </div>
    </form>
  )
}
