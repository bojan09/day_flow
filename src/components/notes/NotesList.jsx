// Component: NotesList
// Purpose: Scrollable sidebar list of notes with pin and delete actions
import { format } from 'date-fns'
import Card from '../ui/Card'

export default function NotesList({ notes, activeId, onSelect, onNew, onDelete, onTogglePin }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-base [color:var(--text)]">All Notes</h3>
        <button
          onClick={onNew}
          className="text-xs px-3 py-1.5 rounded-full [background-color:var(--accent)] text-white font-medium hover:[background-color:var(--accent)] transition-colors"
        >
          + New
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
        {notes.length === 0 && (
          <p className="text-sm [color:var(--text-faint)] italic text-center py-8">No notes yet</p>
        )}
        {notes.map(n => (
          <div
            key={n.id}
            onClick={() => onSelect(n.id)}
            className={`group relative cursor-pointer rounded-xl border p-3.5 transition-all ${
              activeId === n.id
                ? '[background-color:var(--accent)] border-forest-500 text-white'
                : '[background-color:var(--surface)] [border-color:var(--border-soft)] hover:[border-color:var(--border)]'
            }`}
          >
            {n.pinned && (
              <span className="absolute top-2 right-2 text-[10px]">📌</span>
            )}
            <p className={`text-sm font-medium truncate pr-4 ${activeId === n.id ? 'text-white' : '[color:var(--text)]'}`}>
              {n.title}
            </p>
            <p className={`text-xs mt-0.5 truncate ${activeId === n.id ? 'text-white/70' : '[color:var(--text-faint)]'}`}>
              {n.content || 'Empty note...'}
            </p>
            <p className={`text-[10px] mt-1.5 ${activeId === n.id ? 'text-white/50' : '[color:var(--text-faint)]'}`}>
              {format(new Date(n.updatedAt), 'MMM d, h:mm a')}
            </p>

            {/* Actions */}
            <div className={`absolute top-2 right-2 gap-1 ${activeId === n.id ? 'hidden' : 'hidden group-hover:flex'}`}>
              <button
                onClick={e => { e.stopPropagation(); onTogglePin(n.id) }}
                className="w-6 h-6 rounded [background-color:var(--bg-secondary)] hover:[background-color:var(--border)] text-[11px] flex items-center justify-center"
                title="Pin"
              >
                📌
              </button>
              <button
                onClick={e => { e.stopPropagation(); onDelete(n.id) }}
                className="w-6 h-6 rounded bg-red-50 hover:bg-red-100 text-[11px] text-red-400 flex items-center justify-center"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
