// Component: CaptureView
// Purpose: Single "Capture" destination replacing 4 separate nav entries
//          (Notes/Ideas/Brain Dump/Bookmarks). Each type keeps its own data
//          hook/CRUD — this is a routing/shell consolidation only, not a
//          data-model merge.
import { useState } from 'react'
import NotesView     from '../notes/NotesView'
import IdeasView     from '../ideas/IdeasView'
import BrainDump     from '../braindump/BrainDump'
import BookmarksView from '../bookmarks/BookmarksView'
import CaptureInbox from './CaptureInbox'

const TYPES = [
  { id: 'inbox', label: 'Inbox', emoji: '📥' },
  { id: 'notes',     label: 'Notes',      emoji: '📝' },
  { id: 'ideas',     label: 'Ideas',      emoji: '💡' },
  { id: 'braindump', label: 'Brain Dump', emoji: '🧠' },
  { id: 'bookmarks', label: 'Bookmarks',  emoji: '🔖' },
]

export default function CaptureView({
  notes, ideas, bookmarks, tasks, goals, categories, onAddCategory, onRemoveCategory,
  initialType = 'notes', inbox,
}) {
  const [type, setType] = useState(initialType)

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
      {type === 'inbox'     && <CaptureInbox inbox={inbox} />}
      {type === 'ideas'     && <IdeasView ideas={ideas} goals={goals} categories={categories} onAddCategory={onAddCategory} onRemoveCategory={onRemoveCategory} />}
      {type === 'braindump' && <BrainDump tasks={tasks} ideas={ideas} notes={notes} />}
      {type === 'bookmarks' && <BookmarksView bookmarks={bookmarks} />}
    </div>
  )
}
