// Component: CaptureView
// Purpose: Single "Capture" destination replacing 4 separate nav entries
//          (Notes/Ideas/Brain Dump/Bookmarks). Each type keeps its own data
//          hook/CRUD — this is a routing/shell consolidation only, not a
//          data-model merge.
import { useState, useEffect, useRef } from 'react'
import NotesView     from '../notes/NotesView'
import IdeasView     from '../ideas/IdeasView'
import BrainDump     from '../braindump/BrainDump'
import BookmarksView from '../bookmarks/BookmarksView'
import { useBookmarks } from '../../hooks/useBookmarks'
import { consumePendingShare } from '../../services/pendingShare'

const TYPES = [
  { id: 'notes',     label: 'Notes',      emoji: '📝' },
  { id: 'ideas',     label: 'Ideas',      emoji: '💡' },
  { id: 'braindump', label: 'Brain Dump', emoji: '🧠' },
  { id: 'bookmarks', label: 'Bookmarks',  emoji: '🔖' },
]

// bookmarks is owned here rather than at the DashboardPage root: this view and
// two other lazy-loaded ones are its only consumers, so hoisting it made every
// session fetch and subscribe to the bookmarks table up front.
export default function CaptureView({
  notes, ideas, tasks, goals, categories, onAddCategory, onRemoveCategory,
  initialType = 'notes',
}) {
  const [type, setType] = useState(initialType)
  const bookmarks = useBookmarks()

  // A PWA share-target link is stashed at start-up and created here, where the
  // bookmarks hook actually lives. Ref-guarded so React's double-invoked mount
  // effect in development can't add it twice.
  const shareHandledRef = useRef(false)
  useEffect(() => {
    if (shareHandledRef.current) return
    const share = consumePendingShare()
    if (!share) return
    shareHandledRef.current = true
    bookmarks.addBookmark(share)
    setType('bookmarks')
  }, [])

  return (
    <div className="pt-2">
      {/* Type switcher — kept at max-w-4xl (not 2xl) so it doesn't visually
          clash with NotesView's own wider master-detail layout below */}
      <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-1">
        {TYPES.map(t => (
          <button key={t.id} onClick={() => setType(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all border ${
              type === t.id ? 'bg-ink text-white border-ink' : '[background-color:var(--surface)] [border-color:var(--border)] [color:var(--text-muted)]'
            }`}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {type === 'notes'     && <NotesView notes={notes} />}
      {type === 'ideas'     && <IdeasView ideas={ideas} goals={goals} categories={categories} onAddCategory={onAddCategory} onRemoveCategory={onRemoveCategory} />}
      {type === 'braindump' && <BrainDump tasks={tasks} ideas={ideas} notes={notes} />}
      {type === 'bookmarks' && <BookmarksView bookmarks={bookmarks} />}
    </div>
  )
}
