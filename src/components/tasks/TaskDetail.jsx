// Component: TaskDetail
// Purpose: Expandable task detail with notes field and sub-task checklist
import { useState } from 'react'
import Modal from '../ui/Modal'

export default function TaskDetail({ task, tasks, isOpen, onClose }) {
  const [note,    setNote]    = useState(task?.notes   || '')
  const [subText, setSubText] = useState('')

  if (!task) return null

  const subs = task.subTasks || []

  const saveNote = () => tasks.updateTask(task.id, { notes: note })

  const addSub = (e) => {
    e.preventDefault()
    if (!subText.trim()) return
    const updated = [...subs, { id: Date.now().toString(), text: subText.trim(), done: false }]
    tasks.updateTask(task.id, { subTasks: updated })
    setSubText('')
  }

  const toggleSub = (subId) => {
    const updated = subs.map(s => s.id === subId ? { ...s, done: !s.done } : s)
    tasks.updateTask(task.id, { subTasks: updated })
  }

  const deleteSub = (subId) => {
    tasks.updateTask(task.id, { subTasks: subs.filter(s => s.id !== subId) })
  }

  const doneSubs = subs.filter(s => s.done).length

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title}>
      <div className="space-y-5">
        {/* Sub-tasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide">
              Sub-tasks
            </p>
            {subs.length > 0 && (
              <span className="text-xs text-ink-faint">{doneSubs}/{subs.length}</span>
            )}
          </div>

          {subs.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {subs.map(s => (
                <li key={s.id} className="flex items-center gap-2.5 group">
                  <button
                    onClick={() => toggleSub(s.id)}
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-[9px] transition-all ${
                      s.done ? 'bg-forest-500 border-forest-500 text-white' : 'border-stone-300 hover:border-forest-400'
                    }`}
                  >
                    {s.done && '✓'}
                  </button>
                  <span className={`flex-1 text-sm ${s.done ? 'line-through text-ink-faint' : 'text-ink'}`}>
                    {s.text}
                  </span>
                  <button
                    onClick={() => deleteSub(s.id)}
                    className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-red-400 text-xs p-0.5 transition-all"
                  >✕</button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={addSub} className="flex gap-2">
            <input
              value={subText}
              onChange={e => setSubText(e.target.value)}
              placeholder="Add a sub-task..."
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-stone-200 bg-parchment outline-none focus:ring-2 focus:ring-forest-200 text-ink placeholder-ink-faint/50"
            />
            <button
              type="submit"
              disabled={!subText.trim()}
              className="px-3 py-2 rounded-lg bg-forest-500 text-white text-xs font-medium hover:bg-forest-700 disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </form>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Notes</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            onBlur={saveNote}
            placeholder="Add notes about this task..."
            rows={3}
            className="w-full text-sm bg-parchment border border-stone-200 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-forest-200 text-ink placeholder-ink-faint/50 leading-relaxed"
          />
        </div>

        {/* Task meta */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-stone-50">
          <span className="text-[11px] text-ink-faint bg-stone-100 px-2 py-1 rounded-full">{task.category}</span>
          <span className="text-[11px] text-ink-faint bg-stone-100 px-2 py-1 rounded-full capitalize">{task.priority} priority</span>
          {task.estimateMins && (
            <span className="text-[11px] text-ink-faint bg-stone-100 px-2 py-1 rounded-full">
              ⏱ {task.estimateMins < 60 ? `${task.estimateMins}m` : `${task.estimateMins / 60}h`}
            </span>
          )}
        </div>
      </div>
    </Modal>
  )
}
