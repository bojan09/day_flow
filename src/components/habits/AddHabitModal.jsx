// Component: AddHabitModal
// Purpose: Add habit with name, frequency, icon, and pairing suggestion
import { useState } from 'react'
import Modal                 from '../ui/Modal'
import Input                 from '../ui/Input'
import HabitPairingSuggestion from './HabitPairingSuggestion'
import { HABIT_ICONS }       from '../../utils/constants'

const FREQUENCIES = [
  { id: 'daily', label: 'Every day' },
  { id: '3',     label: '3× / week' },
  { id: '4',     label: '4× / week' },
  { id: '5',     label: '5× / week' },
]

export default function AddHabitModal({ isOpen, onClose, onAdd, existingHabits = [] }) {
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

        <HabitPairingSuggestion habits={existingHabits} newHabitIcon={icon} />

        <div>
          <p className="text-xs font-medium [color:var(--text-muted)] uppercase tracking-wide mb-2">Frequency</p>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map(f => (
              <button key={f.id} type="button" onClick={() => setFrequency(f.id)}
                className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                  frequency === f.id ? '[background-color:var(--accent)] text-white border-forest-500' : '[border-color:var(--border)] [color:var(--text-muted)] hover:[background-color:var(--bg-secondary)]'
                }`}>{f.label}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium [color:var(--text-muted)] uppercase tracking-wide mb-2">Icon</p>
          <div className="grid grid-cols-6 gap-2">
            {HABIT_ICONS.map(i => (
              <button key={i} type="button" onClick={() => setIcon(i)}
                className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all border ${
                  icon === i ? '[background-color:var(--accent-light)] [border-color:var(--accent-mid)] scale-110' : '[border-color:var(--border-soft)] hover:[background-color:var(--bg-secondary)]'
                }`}>{i}</button>
            ))}
          </div>
        </div>

        {name.trim() && (
          <div className="flex items-center gap-3 px-4 py-3 [background-color:var(--bg)] rounded-xl">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="text-sm font-medium [color:var(--text)]">{name}</p>
              <p className="text-xs [color:var(--text-faint)]">{FREQUENCIES.find(f => f.id === frequency)?.label}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border [border-color:var(--border)] text-sm [color:var(--text-muted)] hover:[background-color:var(--bg-secondary)] transition-colors">Cancel</button>
          <button type="submit" disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl [background-color:var(--accent)] text-white text-sm font-medium hover:[background-color:var(--accent)] disabled:opacity-40 transition-colors">Add Habit</button>
        </div>
      </form>
    </Modal>
  )
}
