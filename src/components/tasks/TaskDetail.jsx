// Component: TaskDetail
// Purpose: Full task editor — title, priority, date, category, notes, sub-tasks.
//          All fields are editable inline and saved immediately.
import { useState } from 'react'
import Modal from '../ui/Modal'
import { TASK_CATEGORIES } from '../../utils/constants'

const PRIORITIES = ['low', 'medium', 'high']
const PRIORITY_STYLES = {
  high:   { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  medium: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  low:    { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' },
}

export default function TaskDetail({ task, tasks, isOpen, onClose }) {
  const [title,    setTitle]    = useState(task?.title    || '')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [date,     setDate]     = useState(task?.date     || '')
  const [category, setCategory] = useState(task?.category || 'Personal')
  const [note,     setNote]     = useState(task?.notes    || '')
  const [subText,  setSubText]  = useState('')
  const [dirty,    setDirty]    = useState(false)

  if (!task) return null

  const subs    = task.subTasks || []
  const doneSubs = subs.filter(s => s.done).length

  const markDirty = () => setDirty(true)

  const saveAll = () => {
    tasks.updateTask(task.id, { title: title.trim() || task.title, priority, date, category, notes: note })
    setDirty(false)
  }

  const addSub = (e) => {
    e.preventDefault()
    if (!subText.trim()) return
    tasks.updateTask(task.id, {
      subTasks: [...subs, { id: Date.now().toString(), text: subText.trim(), done: false }]
    })
    setSubText('')
  }

  const toggleSub = (id) =>
    tasks.updateTask(task.id, { subTasks: subs.map(s => s.id === id ? { ...s, done: !s.done } : s) })

  const deleteSub = (id) =>
    tasks.updateTask(task.id, { subTasks: subs.filter(s => s.id !== id) })

  const inputStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <Modal isOpen={isOpen} onClose={() => { if (dirty) saveAll(); onClose() }} title="Edit Task">
      <div className="space-y-4">

        {/* Title */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Title
          </label>
          <input
            autoFocus
            value={title}
            onChange={e => { setTitle(e.target.value); markDirty() }}
            className="input-base w-full"
            style={inputStyle}
          />
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>
            Priority
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => {
              const s = PRIORITY_STYLES[p]
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPriority(p); markDirty() }}
                  className="flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all border"
                  style={priority === p
                    ? { backgroundColor: s.bg, borderColor: s.border, color: s.text }
                    : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                  }
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        {/* Date + Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); markDirty() }}
              className="input-base w-full"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Category
            </label>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); markDirty() }}
              className="input-base w-full"
              style={inputStyle}
            >
              {(TASK_CATEGORIES || ['Personal','Work','Health','Learning','Finance','Other']).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-tasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Sub-tasks
            </label>
            {subs.length > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{doneSubs}/{subs.length}</span>
            )}
          </div>
          {subs.length > 0 && (
            <ul className="space-y-1.5 mb-2">
              {subs.map(s => (
                <li key={s.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleSub(s.id)}
                    className="w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all"
                    style={s.done
                      ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                      : { borderColor: 'var(--border)' }
                    }
                  >
                    {s.done && '✓'}
                  </button>
                  <span
                    className="flex-1 text-sm"
                    style={{ color: s.done ? 'var(--text-faint)' : 'var(--text)', textDecoration: s.done ? 'line-through' : 'none' }}
                  >
                    {s.text}
                  </span>
                  <button
                    onClick={() => deleteSub(s.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs transition-all"
                    style={{ color: 'var(--text-faint)' }}
                    onMouseOver={e => e.target.style.color = '#ef4444'}
                    onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
                  >✕</button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={addSub} className="flex gap-2">
            <input
              value={subText}
              onChange={e => setSubText(e.target.value)}
              placeholder="Add a sub-task…"
              className="input-base flex-1 text-sm"
              style={inputStyle}
            />
            <button
              type="submit" disabled={!subText.trim()}
              className="px-3 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Add
            </button>
          </form>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Notes
          </label>
          <textarea
            value={note}
            onChange={e => { setNote(e.target.value); markDirty() }}
            placeholder="Add notes…"
            rows={3}
            className="input-base w-full resize-none"
            style={inputStyle}
          />
        </div>

        {/* Save button */}
        <div className="flex gap-3 pt-1">
          <button
            type="button" onClick={() => { if (dirty) saveAll(); onClose() }}
            className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { saveAll(); onClose() }}
            disabled={!dirty && title === task.title}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Save changes
          </button>
        </div>
      </div>
    </Modal>
  )
}
