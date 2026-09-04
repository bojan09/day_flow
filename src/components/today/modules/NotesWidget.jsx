// Component: NotesWidget
// Purpose: Mini Today dashboard card — recent notes with quick-create.
import { memo } from 'react'
import { format, parseISO } from 'date-fns'

function NotesWidget({ notes, onTabChange }) {
  const recent = [...(notes?.notes || [])]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 4)

  return (
    <div className="space-y-1 px-4 pb-3">
      {recent.length === 0 ? (
        <p className="text-sm italic text-center py-2" style={{ color: 'var(--text-faint)' }}>
          No notes yet
        </p>
      ) : (
        recent.map(n => (
          <button type="button" key={n.id}
            onClick={() => onTabChange?.('notes')}
            className="hover-surface w-full flex items-start gap-2.5 py-1.5 text-left rounded-xl transition-colors"
          >
            <span className="text-base flex-shrink-0">📝</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                {n.title || 'Untitled'}
              </p>
              {n.createdAt && (
                <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                  {format(parseISO(n.createdAt), 'MMM d')}
                </p>
              )}
            </div>
          </button>
        ))
      )}
      <button type="button" onClick={() => onTabChange?.('notes')}
        className="text-xs font-medium pt-1" style={{ color: 'var(--accent-text)' }}>
        View all notes →
      </button>
    </div>
  )
}

export default memo(NotesWidget)
