// Component: AddHabitModal
// Purpose: Modal form to add a habit — name, icon picker, frequency (daily or X/week)
import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import { HABIT_ICONS } from '../../utils/constants'

const FREQUENCIES = [
  { id: 'daily',  label: 'Every day' },
  { id: '3',      label: '3× / week' },
  { id: '4',      label: '4× / week' },
  { id: '5',      label: '5× / week' },
]

export default function AddHabitModal({ isOpen, onClose, onAdd }) {
  const [name,      setName]      = useState('')
  const [icon,      setIcon]      = useState('⭐')
  const [frequency, setFrequency] = useState('daily')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name, icon, frequency: frequency === 'daily' ? 'daily' : Number(frequency) })
    setName(''); setIcon('⭐'); setFrequency('daily')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Habit">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Habit name" placeholder="e.g. Morning run, Read 20 pages..."
          value={name} onChange={e => setName(e.target.value)} autoFocus />

        {/* Frequency */}
        <div>
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Frequency</p>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map(f => (
              <button key={f.id} type="button" onClick={() => setFrequency(f.id)}
                className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                  frequency === f.id
                    ? 'bg-forest-500 text-white border-forest-500'
                    : 'border-stone-200 text-ink-muted hover:bg-stone-50'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Icon</p>
          <div className="grid grid-cols-6 gap-2">
            {HABIT_ICONS.map(i => (
              <button key={i} type="button" onClick={() => setIcon(i)}
                className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all border ${
                  icon === i ? 'bg-forest-50 border-forest-300 scale-110' : 'border-stone-100 hover:bg-stone-50'
                }`}>
                {i}
              </button>
            ))}
          </div>
        </div>

        {name.trim() && (
          <div className="flex items-center gap-3 px-4 py-3 bg-parchment rounded-xl">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-sm font-medium text-ink">{name}</p>
              <p className="text-xs text-ink-faint">{FREQUENCIES.find(f => f.id === frequency)?.label}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-ink-muted hover:bg-stone-50 transition-colors">Cancel</button>
          <button type="submit" disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-40 transition-colors">Add Habit</button>
        </div>
      </form>
    </Modal>
  )
}
