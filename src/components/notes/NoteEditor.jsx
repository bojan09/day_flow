// Component: NoteEditor
// Purpose: Full note editing experience with title, content, and auto-save on blur
import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export default function NoteEditor({ note, onUpdate, onBack }) {
  const [title,   setTitle]   = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [saved,   setSaved]   = useState(true)

  // Sync when switching notes
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setSaved(true)
  }, [note.id])

  const save = () => {
    onUpdate(note.id, { title, content })
    setSaved(true)
  }

  const handleTitleChange = (e) => { setTitle(e.target.value); setSaved(false) }
  const handleContentChange = (e) => { setContent(e.target.value); setSaved(false) }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
        <button
          onClick={onBack}
          className="md:hidden text-xs text-ink-muted hover:text-ink transition-colors flex items-center gap-1"
        >
          ← Back
        </button>
        <p className="text-xs text-ink-faint ml-auto">
          {saved ? `Saved · ${format(new Date(note.updatedAt), 'h:mm a')}` : 'Unsaved changes'}
        </p>
        {!saved && (
          <button
            onClick={save}
            className="ml-3 text-xs px-3 py-1 rounded-full bg-forest-500 text-white hover:bg-forest-700 transition-colors"
          >
            Save
          </button>
        )}
      </div>

      {/* Title */}
      <input
        className="w-full px-5 pt-5 pb-2 font-serif text-2xl text-ink bg-transparent outline-none placeholder-ink-faint/50 border-none"
        placeholder="Note title..."
        value={title}
        onChange={handleTitleChange}
        onBlur={save}
      />

      {/* Content */}
      <textarea
        className="flex-1 w-full px-5 pb-5 text-sm text-ink-muted leading-relaxed bg-transparent outline-none resize-none placeholder-ink-faint/40 border-none"
        placeholder="Start writing..."
        value={content}
        onChange={handleContentChange}
        onBlur={save}
      />
    </div>
  )
}
