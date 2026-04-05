// Component: NoteEditor
// Purpose: Full note editor with title, content, tag pills, word count, read time, auto-save
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { NOTE_TAGS } from '../../hooks/useNotes'

export default function NoteEditor({ note, onUpdate, onBack, getWordCount, getReadTime }) {
  const [title,   setTitle]   = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags,    setTags]    = useState(note.tags || [])
  const [saved,   setSaved]   = useState(true)

  useEffect(() => {
    setTitle(note.title);  setContent(note.content)
    setTags(note.tags || []); setSaved(true)
  }, [note.id])

  const save = () => {
    onUpdate(note.id, { title, content, tags })
    setSaved(true)
  }

  const toggleTag = (tag) => {
    const next = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    setTags(next)
    setSaved(false)
  }

  const words   = getWordCount(content)
  const minRead = getReadTime(content)

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-stone-100">
        <button onClick={onBack} className="md:hidden text-xs text-ink-muted hover:text-ink transition-colors">← Back</button>
        <div className="flex items-center gap-3 ml-auto text-xs text-ink-faint">
          <span>{words} words · {minRead} min read</span>
          <span>{saved ? `Saved ${format(new Date(note.updatedAt), 'h:mm a')}` : 'Unsaved'}</span>
          {!saved && (
            <button onClick={save} className="px-3 py-1 rounded-full bg-forest-500 text-white hover:bg-forest-700 transition-colors">Save</button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 px-5 pt-3 pb-1 flex-wrap">
        {NOTE_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all border ${
              tags.includes(tag)
                ? 'bg-forest-500 text-white border-forest-500'
                : 'border-stone-200 text-ink-faint hover:border-stone-300 hover:text-ink'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        className="w-full px-5 pt-3 pb-1 font-serif text-2xl text-ink bg-transparent outline-none placeholder-ink-faint/40"
        placeholder="Note title..."
        value={title}
        onChange={e => { setTitle(e.target.value); setSaved(false) }}
        onBlur={save}
      />

      {/* Content */}
      <textarea
        className="flex-1 w-full px-5 pb-5 text-sm text-ink-muted leading-relaxed bg-transparent outline-none resize-none placeholder-ink-faint/40"
        placeholder="Start writing..."
        value={content}
        onChange={e => { setContent(e.target.value); setSaved(false) }}
        onBlur={save}
      />
    </div>
  )
}
