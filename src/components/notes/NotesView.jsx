// Component: NotesView
// Purpose: Notes & journal tab — list on left, editor on right (stacked on mobile)
import { useState } from 'react'
import NotesList  from './NotesList'
import NoteEditor from './NoteEditor'

export default function NotesView({ notes }) {
  const [activeId, setActiveId] = useState(null)

  const activeNote = notes.notes.find(n => n.id === activeId) ?? null

  const handleNew = () => {
    const note = notes.addNote({ title: 'Untitled', content: '' })
    setActiveId(note.id)
  }

  const handleSelect = (id) => setActiveId(id)

  const handleDelete = (id) => {
    notes.deleteNote(id)
    if (activeId === id) setActiveId(null)
  }

  return (
    <div className="max-w-4xl mx-auto pt-2">
      <div className="flex gap-4 h-[calc(100vh-140px)]">
        {/* Sidebar list */}
        <div className={`w-full md:w-64 flex-shrink-0 ${activeNote ? 'hidden md:block' : 'block'}`}>
          <NotesList
            notes={notes.notes}
            activeId={activeId}
            onSelect={handleSelect}
            onNew={handleNew}
            onDelete={handleDelete}
            onTogglePin={notes.togglePin}
          />
        </div>

        {/* Editor */}
        <div className={`flex-1 min-w-0 ${!activeNote ? 'hidden md:flex' : 'flex'} flex-col`}>
          {activeNote ? (
            <NoteEditor
              note={activeNote}
              onUpdate={(id, updates) => notes.updateNote(id, updates)}
              onBack={() => setActiveId(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-5xl mb-4">📝</p>
              <p className="text-ink-muted text-sm mb-4">Select a note or create a new one</p>
              <button
                onClick={handleNew}
                className="px-5 py-2.5 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors"
              >
                + New Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
