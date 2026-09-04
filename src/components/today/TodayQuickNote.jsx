// Component: TodayQuickNote
// Purpose: Latest note preview on Today tab — theme-aware
export default function TodayQuickNote({ notes }) {
  const { notes: list, addNote } = notes
  const latest = list[0]

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="px-5 pt-4 pb-3 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--border-soft)' }}>
        <h3 className="font-serif text-base" style={{ color: 'var(--text)' }}>Latest Note</h3>
      </div>
      {!latest ? (
        <div className="px-5 py-6 text-center">
          <p className="text-sm italic mb-3" style={{ color: 'var(--text-faint)' }}>No notes yet</p>
          <button
            onClick={() => addNote({ title: 'Quick note', content: '' })}
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--accent-text)' }}
          >+ New note</button>
        </div>
      ) : (
        <div className="px-5 py-4">
          <p className="text-xs font-medium truncate mb-1" style={{ color: 'var(--text-muted)' }}>{latest.title}</p>
          <p className="text-sm leading-relaxed line-clamp-3 italic font-serif" style={{ color: 'var(--text-muted)' }}>
            {latest.content || 'Empty note…'}
          </p>
        </div>
      )}
    </div>
  )
}
