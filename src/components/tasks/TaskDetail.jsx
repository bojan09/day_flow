// Component: TaskDetail
// Purpose: Full task editor — title, priority, date, category (with custom), notes, sub-tasks.
import { useState } from 'react'
import Modal          from '../ui/Modal'
import CategoryPicker from '../ui/CategoryPicker'

const PRIORITIES = ['low', 'medium', 'high']
const PRIORITY_STYLES = {
  high:   { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  medium: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  low:    { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' },
}

export default function TaskDetail({
  task, tasks, isOpen, onClose,
  categories, onAddCategory, onRemoveCategory,
  projects, ideas,
}) {
  const [title,    setTitle]    = useState(task?.title    || '')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [date,     setDate]     = useState(task?.date     || '')
  const [category, setCategory] = useState(task?.category || 'Personal')
  const [note,     setNote]     = useState(task?.notes    || '')
  const [subText,  setSubText]  = useState('')
  const [dirty,    setDirty]    = useState(false)

  if (!task) return null

  const subs     = task.subTasks || []
  const doneSubs = subs.filter(s => s.done).length
  const mark     = () => setDirty(true)

  const saveAll = () => {
    tasks.updateTask(task.id, {
      title:    title.trim() || task.title,
      priority, date, category, notes: note,
    })
    setDirty(false)
  }

  const addSub = (e) => {
    e.preventDefault()
    if (!subText.trim()) return
    tasks.updateTask(task.id, {
      subTasks: [...subs, { id: Date.now().toString(), text: subText.trim(), done: false }],
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
            autoFocus value={title}
            onChange={e => { setTitle(e.target.value); mark() }}
            className="input-base w-full" style={inputStyle}
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
                <button key={p} type="button"
                  onClick={() => { setPriority(p); mark() }}
                  className="flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all border"
                  style={priority === p
                    ? { backgroundColor: s.bg, borderColor: s.border, color: s.text }
                    : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                  }
                >{p}</button>
              )
            })}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Date
          </label>
          <input
            type="date" value={date}
            onChange={e => { setDate(e.target.value); mark() }}
            className="input-base w-full" style={inputStyle}
          />
        </div>

        {/* Category — uses CategoryPicker with custom support */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>
            Category
          </label>
          <CategoryPicker
            value={category}
            onChange={v => { setCategory(v); mark() }}
            categories={categories}
            onAddCategory={onAddCategory}
            onRemoveCategory={onRemoveCategory}
          />
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
                  >{s.done && '✓'}</button>
                  <span
                    className="flex-1 text-sm"
                    style={{ color: s.done ? 'var(--text-faint)' : 'var(--text)', textDecoration: s.done ? 'line-through' : 'none' }}
                  >{s.text}</span>
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
              value={subText} onChange={e => setSubText(e.target.value)}
              placeholder="Add a sub-task…"
              className="input-base flex-1 text-sm" style={inputStyle}
            />
            <button type="submit" disabled={!subText.trim()}
              className="px-3 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)' }}
            >Add</button>
          </form>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Notes
          </label>
          <textarea
            value={note} onChange={e => { setNote(e.target.value); mark() }}
            placeholder="Add notes…" rows={3}
            className="input-base w-full resize-none" style={inputStyle}
          />
        </div>

        {/* Transfer task */}
        {(projects?.length > 0 || ideas) && (
          <div>
            <label className="text-xs font-medium uppercase tracking-wide block mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Move to
            </label>
            <div className="flex gap-2 flex-wrap">
              {projects?.length > 0 && (
                <select
                  defaultValue=""
                  onChange={e => {
                    if (!e.target.value) return
                    tasks.updateTask(task.id, { projectId: e.target.value })
                    onClose()
                  }}
                  className="flex-1 text-sm px-3 py-2 rounded-xl border outline-none"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <option value="">🗂️ Move to project…</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
              {ideas && (
                <button
                  type="button"
                  onClick={() => {
                    ideas.addIdea({ title: task.title, description: note, category: category })
                    tasks.deleteTask(task.id)
                    onClose()
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  💡 Move to Ideas
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => { if (dirty) saveAll(); onClose() }}
            className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >Cancel</button>
          <button type="button" onClick={() => { saveAll(); onClose() }}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >Save changes</button>
        </div>
      </div>
    </Modal>
  )
}
