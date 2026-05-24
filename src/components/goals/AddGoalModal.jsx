// Component: AddGoalModal
// Purpose: Modal form to create a new goal with type, category, target date
import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import { GOAL_TYPES, GOAL_CATEGORIES } from '../../hooks/useGoals'

export default function AddGoalModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', description: '', type: 'Yearly', category: 'Personal', targetDate: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onAdd(form)
    setForm({ title: '', description: '', type: 'Yearly', category: 'Personal', targetDate: '' })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Goal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Goal title" placeholder="What do you want to achieve?"
          value={form.title} onChange={e => set('title', e.target.value)} autoFocus />

        <div>
          <label className="text-xs font-medium [color:var(--text-muted)] uppercase tracking-wide block mb-1.5">Description (optional)</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Why does this matter to you?"
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border [border-color:var(--border)] [background-color:var(--bg)] text-sm [color:var(--text)] outline-none resize-none focus:ring-2 focus:[box-shadow:0_0_0_3px_var(--accent-light)] [placeholder-color:var(--text-faint)]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium [color:var(--text-muted)] uppercase tracking-wide mb-2">Type</p>
            <div className="flex flex-col gap-1.5">
              {GOAL_TYPES.map(t => (
                <button key={t} type="button" onClick={() => set('type', t)}
                  className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                    form.type === t ? '[background-color:var(--accent)] text-white [border-color:var(--accent)]' : '[border-color:var(--border)] [color:var(--text-muted)] hover:[background-color:var(--bg-secondary)]'
                  }`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium [color:var(--text-muted)] uppercase tracking-wide mb-2">Category</p>
            <div className="flex flex-col gap-1.5">
              {GOAL_CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => set('category', c)}
                  className={`py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    form.category === c ? 'bg-ink text-white border-ink' : '[border-color:var(--border)] [color:var(--text-muted)] hover:[background-color:var(--bg-secondary)]'
                  }`}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        <Input label="Target date (optional)" type="date"
          value={form.targetDate} onChange={e => set('targetDate', e.target.value)} />

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border [border-color:var(--border)] text-sm [color:var(--text-muted)] hover:[background-color:var(--bg-secondary)]">Cancel</button>
          <button type="submit" disabled={!form.title.trim()}
            className="flex-1 py-2.5 rounded-xl [background-color:var(--accent)] text-white text-sm font-medium hover:[background-color:var(--accent)] disabled:opacity-40">Add Goal</button>
        </div>
      </form>
    </Modal>
  )
}
