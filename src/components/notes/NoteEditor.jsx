// Component: NoteEditor
// Purpose: Full note editor with tags, word count, auto-save, and file attachments
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { NOTE_TAGS } from '../../hooks/useNotes'
import NoteAttachments from './NoteAttachments'

export default function NoteEditor({ note, onUpdate, onBack, getWordCount, getReadTime }) {
  const [title,   setTitle]   = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [tags,    setTags]    = useState(note.tags || [])
  const [saved,   setSaved]   = useState(true)

  useEffect(() => {
    setTitle(note.title); setContent(note.content)
    setTags(note.tags || []); setSaved(true)
  }, [note.id])

  const save = () => { onUpdate(note.id, { title, content, tags }); setSaved(true) }

  const toggleTag = (tag) => {
    const next = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    setTags(next); setSaved(false)
  }

  const words   = getWordCount(content)
  const minRead = getReadTime(content)

  return (
    <div
      className="flex flex-col h-full rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-5 py-2.5 border-b flex-wrap"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <button onClick={onBack} className="md:hidden text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>← Back</button>
        <div className="flex items-center gap-3 ml-auto flex-wrap text-xs" style={{ color: 'var(--text-faint)' }}>
          <span>{words} words · {minRead} min</span>
          <span>{saved ? `Saved ${format(new Date(note.updatedAt), 'h:mm a')}` : 'Unsaved'}</span>
          {!saved && (
            <button onClick={save}
              className="px-3 py-1 rounded-full text-white text-xs font-medium transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}>
              Save
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 px-5 pt-3 pb-1 flex-wrap">
        {NOTE_TAGS.map(tag => (
          <button key={tag} onClick={() => toggleTag(tag)}
            className="px-2.5 py-0.5 rounded-full text-xs font-medium transition-all border"
            style={tags.includes(tag)
              ? { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
              : { borderColor: 'var(--border)', color: 'var(--text-faint)' }
            }>
            #{tag}
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        className="w-full px-5 pt-3 pb-1 font-serif text-2xl bg-transparent outline-none border-none"
        style={{ color: 'var(--text)', caretColor: 'var(--accent)' }}
        placeholder="Note title..."
        value={title}
        onChange={e => { setTitle(e.target.value); setSaved(false) }}
        onBlur={save}
      />

      {/* Content */}
      <textarea
        className="flex-1 w-full px-5 pb-3 text-sm leading-relaxed bg-transparent outline-none resize-none border-none"
        style={{ color: 'var(--text-muted)', caretColor: 'var(--accent)' }}
        placeholder="Start writing..."
        value={content}
        onChange={e => { setContent(e.target.value); setSaved(false) }}
        onBlur={save}
      />

      {/* Attachments */}
      <div className="px-5 pb-4 border-t pt-3" style={{ borderColor: 'var(--border-soft)' }}>
        <p className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>
          Attachments
        </p>
        <NoteAttachments
          noteId={note.id}
          attachments={note.attachments || []}
          onUpdate={(attachments) => onUpdate(note.id, { attachments })}
        />
      </div>
    </div>
  )
}
