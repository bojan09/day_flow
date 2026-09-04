// Component: HabitRow
// Purpose: Single habit row — 7-day toggle circles, streak, edit, delete.
import { memo, useState } from 'react'
import { habitDisplayName } from '../../utils/habitLabels'
import Modal       from '../ui/Modal'
import EmojiPicker from '../ui/EmojiPicker'
import Input  from '../ui/Input'
import { getDateKey } from '../../utils/dateUtils'
import { isToday, format } from 'date-fns'
import { HABIT_ICONS } from '../../utils/constants'

const FREQUENCIES = [
  { id: 'daily', label: 'Every day'  },
  { id: '3',     label: '3× / week' },
  { id: '4',     label: '4× / week' },
  { id: '5',     label: '5× / week' },
]

export function EditHabitModal({ habit, onSave, onClose }) {
  const [name,      setName]      = useState(habit.name)
  const [icon,      setIcon]      = useState(habit.icon)
  const [frequency, setFrequency] = useState(
    habit.frequency === 'daily' ? 'daily' : String(habit.frequency)
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), icon, frequency: frequency === 'daily' ? 'daily' : Number(frequency) })
    onClose()
  }

  return (
    <Modal isOpen onClose={onClose} title="Edit Habit" fullScreenOnMobile>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Habit name" value={name} onChange={e => setName(e.target.value)} autoFocus />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Frequency</p>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map(f => (
              <button key={f.id} type="button" onClick={() => setFrequency(f.id)}
                className="py-2 rounded-xl text-sm font-medium transition-all border"
                style={frequency === f.id
                  ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                  : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                }>{f.label}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Icon</p>
          <EmojiPicker value={icon} onChange={setIcon} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Cancel</button>
          <button type="submit" disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)' }}>Save changes</button>
        </div>
      </form>
    </Modal>
  )
}

function HabitRow({ habit, weekDays, isHabitDone, toggleHabitDay, streak, weeklyCount, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const freqLabel = habit.frequency === 'daily'
    ? 'daily'
    : `${weeklyCount}/${habit.frequency}× wk`

  return (
    <>
      <div
        className="hover-surface group grid items-center gap-2 px-3 sm:px-5 py-3 transition-colors"
        style={{ gridTemplateColumns: 'var(--habit-label-col, 124px) repeat(7, minmax(1.75rem,1fr))', gap: '0.25rem' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0 leading-none">{habit.icon}</span>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-sm font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: 'var(--text)' }}>
              {habitDisplayName(habit)}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] capitalize flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{freqLabel}</span>
              {streak > 0 && (
                <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: 'var(--accent-text)' }}>🔥{streak}</span>
              )}
            </div>
          </div>
          {/* Edit + delete — visible on hover */}
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              aria-label="Edit habit"
              className="tap-target w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors"
              style={{ color: 'var(--text-faint)' }}
              title="Edit habit"
            >✏️</button>
            <button
              onClick={() => onDelete(habit.id)}
              aria-label="Delete habit"
              className="tap-target hover-danger w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors"
              style={{ color: 'var(--text-faint)' }}
              title="Delete habit"
            >✕</button>
          </div>
        </div>

        {weekDays.map(day => {
          const dateKey = getDateKey(day)
          const done    = isHabitDone(habit.id, dateKey)
          const today   = isToday(day)
          return (
            <button
              key={dateKey}
              onClick={() => toggleHabitDay(habit.id, dateKey)}
              aria-label={`${habitDisplayName(habit)} — ${format(day, 'EEEE')} ${done ? 'done, tap to undo' : 'not done, tap to mark done'}`}
              aria-pressed={done}
              className="tap-target w-6 h-6 sm:w-7 sm:h-7 mx-auto rounded-full border-2 flex items-center justify-center text-[10px] transition-all"
              style={done
                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                : today
                ? { borderColor: 'var(--accent-mid)' }
                : { borderColor: 'var(--border)' }
              }
            >{done && '✓'}</button>
          )
        })}
      </div>

      {editing && (
        <EditHabitModal
          habit={habit}
          onSave={(updates) => onEdit(habit.id, updates)}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}

export default memo(HabitRow)
