// Component: AddHabitModal
// Purpose: Modal with name + icon picker for creating a new habit
import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import { HABIT_ICONS } from '../../utils/constants'

export default function AddHabitModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('⭐')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name, icon })
    setName('')
    setIcon('⭐')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Habit">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Habit name"
          placeholder="e.g. Morning run, Read 20 pages..."
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />

        {/* Icon picker */}
        <div>
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Choose an icon</p>
          <div className="grid grid-cols-6 gap-2">
            {HABIT_ICONS.map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all border ${
                  icon === i
                    ? 'bg-forest-50 border-forest-300 shadow-sm scale-110'
                    : 'border-stone-100 hover:bg-stone-50 hover:border-stone-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {name.trim() && (
          <div className="flex items-center gap-3 px-4 py-3 bg-parchment rounded-xl">
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-medium text-ink">{name}</span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-ink-muted hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-40 transition-colors"
          >
            Add Habit
          </button>
        </div>
      </form>
    </Modal>
  )
}
