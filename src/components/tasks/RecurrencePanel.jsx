// Component: RecurrencePanel
// Purpose: Manage a recurring task template after creation — pause/resume,
//          stop recurrence, edit recur days, set an end date.
//          Opened from the 🔁 badge on a recurring task row.
import { useState } from 'react'
import Modal from '../ui/Modal'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function RecurrencePanel({ task, onUpdate, onClose }) {
  const [days,    setDays]    = useState(task.recurDays || [])
  const [endDate, setEndDate] = useState(task.recurEndDate || '')
  const status = task.recurStatus ?? 'active'

  const toggleDay = (d) =>
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  const save = (extra = {}) => {
    onUpdate(task.id, { recurDays: days, recurEndDate: endDate || null, ...extra })
    onClose()
  }

  return (
    <Modal isOpen onClose={onClose} title="Manage recurrence">
      <div className="space-y-5">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Status</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {status === 'active' ? 'Spawning on scheduled days' : 'Paused — no new tasks created'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => save({ recurStatus: status === 'active' ? 'paused' : 'active' })}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: status === 'active' ? 'var(--bg-secondary)' : 'var(--accent)',
              color:           status === 'active' ? 'var(--text)' : '#fff',
            }}
          >
            {status === 'active' ? 'Pause' : 'Resume'}
          </button>
        </div>

        {/* Days */}
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Repeats on</p>
          <div className="flex gap-1.5 flex-wrap">
            {DAYS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: days.includes(d) ? 'var(--accent)' : 'var(--bg-secondary)',
                  color:           days.includes(d) ? '#fff' : 'var(--text-muted)',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* End date */}
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Ends</p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="input-base flex-1"
              aria-label="Recurrence end date"
            />
            {endDate && (
              <button
                type="button"
                onClick={() => setEndDate('')}
                className="text-xs font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Never
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-soft)' }}>
          <button
            type="button"
            onClick={() => save({ isRecurring: false, recurDays: [], recurStatus: 'active', recurEndDate: null })}
            className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            Stop recurrence
          </button>
          <button
            type="button"
            onClick={() => save()}
            className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}
