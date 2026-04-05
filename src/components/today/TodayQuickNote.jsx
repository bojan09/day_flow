// Component: TodayQuickNote
// Purpose: Shows the most recent note as a quick preview on the Today tab
import Card from '../ui/Card'

export default function TodayQuickNote({ notes }) {
  const { notes: list, addNote } = notes
  const latest = list[0]

  const handleNew = () => {
    addNote({ title: 'Quick note', content: '' })
  }

  return (
    <Card noPad>
      <div className="px-5 pt-4 pb-3 border-b border-stone-50 flex items-center justify-between">
        <h3 className="font-serif text-base text-ink">Latest Note</h3>
      </div>
      {!latest ? (
        <div className="px-5 py-6 text-center">
          <p className="text-sm text-ink-faint mb-3 italic">No notes yet</p>
          <button onClick={handleNew} className="text-xs text-forest-500 hover:text-forest-700 font-medium transition-colors">
            + New note
          </button>
        </div>
      ) : (
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-ink-muted mb-1 truncate">{latest.title}</p>
          <p className="text-sm text-ink-muted leading-relaxed line-clamp-3 italic font-serif">
            {latest.content || 'Empty note...'}
          </p>
        </div>
      )}
    </Card>
  )
}
