// Component: RepeatingItemRow
// Purpose: One normalized recurring item — shows meta, toggles pause, edit, delete.
import Badge from '../ui/Badge'

const TYPE_ICON = { task: '✅', workout: '🏋️' }

export default function RepeatingItemRow({ item, onTogglePause, onEdit, onStop }) {
  const paused = item.status === 'paused'

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 border-b last:border-b-0"
      style={{ borderColor: 'var(--border-soft)' }}
    >
      <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">{TYPE_ICON[item.type] || '🔁'}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text)' }}>
            {item.name}
          </p>
          <Badge label={item.type} color="default" />
          {paused && <Badge label="paused" color="default" />}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <span className="font-medium" style={{ color: 'var(--accent-text)' }}>{item.frequency}</span>
          <span>· {item.scheduleLabel}</span>
          {item.nextOccurrence && <span>· next {item.nextOccurrence}</span>}
          {item.endDate && <span>· ends {item.endDate}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => onTogglePause(item)}
          aria-label={paused ? 'Resume' : 'Pause'}
          className="tap-target px-2.5 py-1 rounded-full text-[11px] font-semibold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: paused ? 'var(--accent)' : 'var(--bg-secondary)',
            color:           paused ? '#fff' : 'var(--text)',
          }}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          onClick={() => onEdit(item)}
          aria-label="Edit"
          className="tap-target w-7 h-7 rounded-full flex items-center justify-center text-xs"
          style={{ color: 'var(--text-faint)' }}
        >✏️</button>
        <button
          type="button"
          onClick={() => onStop(item)}
          aria-label="Stop repeating"
          className="tap-target hover-danger w-7 h-7 rounded-full flex items-center justify-center text-xs"
          style={{ color: 'var(--text-faint)' }}
        >✕</button>
      </div>
    </div>
  )
}
