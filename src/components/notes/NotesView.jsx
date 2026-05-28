import ViewSkeleton from '../ui/ViewSkeleton'
// Component: NotesView
// Purpose: Notes tab with tag filter + date range filter, list, and editor
import { useState } from 'react'
import NotesList  from './NotesList'
import NoteEditor from './NoteEditor'
import { NOTE_TAGS } from '../../hooks/useNotes'
import { format, subDays } from 'date-fns'

const DATE_FILTERS = [
  { id: 'all',    label: 'All time'  },
  { id: '7',      label: 'Last 7d'  },
  { id: '30',     label: 'Last 30d' },
  { id: 'month',  label: 'This month' },
]

export default function NotesView({ notes }) {
  const [activeId,    setActiveId]    = useState(null)
  const [filterTag,   setFilterTag]   = useState(null)
  const [dateFilter,  setDateFilter]  = useState('all')

  const activeNote = notes.notes.find(n => n.id === activeId) ?? null

  const handleNew = () => {
    const note = notes.addNote({ title: 'Untitled', content: '' })
    setActiveId(note.id)
  }

  const applyDateFilter = (note) => {
    if (dateFilter === 'all') return true
    const updated = new Date(note.updatedAt)
    if (dateFilter === '7')  return updated >= subDays(new Date(), 7)
    if (dateFilter === '30') return updated >= subDays(new Date(), 30)
    if (dateFilter === 'month') {
      const now = new Date()
      return updated.getMonth() === now.getMonth() && updated.getFullYear() === now.getFullYear()
    }
    return true
  }

  const displayNotes = notes.notes
    .filter(n => !filterTag || n.tags.includes(filterTag))
    .filter(applyDateFilter)


  if (!notes.synced) return <ViewSkeleton type="notes" />
  return (
    <div className="max-w-4xl mx-auto pt-2">
      <div className="flex gap-4 h-[calc(100vh-140px)]">
        <div className={`w-full md:w-64 flex-shrink-0 flex flex-col gap-2 ${activeNote ? 'hidden md:flex' : 'flex'}`}>
          {/* Date filter */}
          <div className="flex gap-1 [background-color:var(--bg-secondary)] rounded-xl p-0.5">
            {DATE_FILTERS.map(f => (
              <button key={f.id} onClick={() => setDateFilter(f.id)}
                className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-all ${dateFilter === f.id ? '[background-color:var(--surface)] shadow-sm [color:var(--text)]' : '[color:var(--text-muted)]'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Tag filter */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            <button onClick={() => setFilterTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-all border ${!filterTag ? 'bg-ink text-white border-ink' : '[border-color:var(--border)] [color:var(--text-muted)] hover:[background-color:var(--bg-secondary)]'}`}>
              All
            </button>
            {NOTE_TAGS.map(tag => (
              <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-all border ${filterTag === tag ? '[background-color:var(--accent)] text-white [border-color:var(--accent)]' : '[border-color:var(--border)] [color:var(--text-muted)] hover:[background-color:var(--bg-secondary)]'}`}>
                #{tag}
              </button>
            ))}
          </div>

          <NotesList notes={displayNotes} activeId={activeId} onSelect={setActiveId}
            onNew={handleNew}
            onDelete={(id) => { notes.deleteNote(id); if (activeId === id) setActiveId(null) }}
            onTogglePin={notes.togglePin} />
        </div>

        <div className={`flex-1 min-w-0 ${!activeNote ? 'hidden md:flex' : 'flex'} flex-col`}>
          {activeNote ? (
            <NoteEditor note={activeNote} onUpdate={notes.updateNote} onBack={() => setActiveId(null)}
              getWordCount={notes.getWordCount} getReadTime={notes.getReadTime} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-5xl mb-3">📝</p>
              <p className="[color:var(--text-muted)] text-sm mb-4">Select a note or create a new one</p>
              <button onClick={handleNew}
                className="px-5 py-2.5 rounded-full [background-color:var(--accent)] text-white text-sm font-medium hover:[background-color:var(--accent)] transition-colors">
                + New Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
