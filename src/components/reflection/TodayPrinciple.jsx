// Component: TodayPrinciple
// Purpose: Keeps the morning's Stoic principle present through the day —
//          "the morning Stoic principle should not disappear after the Morning
//          Review". Deliberately quiet: one line, collapsed, no notifications.
//
// Renders only once the morning is done and a reference was recorded, so it
// never shows a passage the user hasn't actually been given.
import { useState } from 'react'
import { Quote, BookmarkPlus, Check } from 'lucide-react'
import { useReflections } from '../../hooks/useReflections'

export default function TodayPrinciple({ notes }) {
  const { entry, morningDone } = useReflections()
  const [open, setOpen]   = useState(false)
  const [saved, setSaved] = useState(false)

  const ref = entry?.stoicRef
  if (!morningDone || !ref?.quote) return null

  // §23 — saves into the existing Capture/notes system rather than starting a
  // second journal.
  const saveToCapture = () => {
    const attribution = `${ref.author} — ${ref.work}${ref.section ? `, ${ref.section}` : ''}`
    notes?.addNote?.({
      title: `Principle — ${ref.author}`,
      content: `“${ref.quote}”\n\n${attribution}\nTranslation: ${ref.translation}${ref.meaning ? `\n\n${ref.meaning}` : ''}`,
      tags: ['reflection'],
    })
    setSaved(true)
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <Quote size={15} strokeWidth={2} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            Today's principle
          </p>
          <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{ref.quote}</p>
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t pt-3" style={{ borderColor: 'var(--border-soft)' }}>
          <blockquote className="font-serif text-lg leading-relaxed" style={{ color: 'var(--text)' }}>
            “{ref.quote}”
          </blockquote>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {ref.author} — {ref.work}{ref.section ? `, ${ref.section}` : ''}
          </p>
          {ref.meaning && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{ref.meaning}</p>
          )}
          <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>Translation: {ref.translation}</p>

          {notes?.addNote && (
            <button
              type="button"
              onClick={saveToCapture}
              disabled={saved}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all disabled:opacity-70"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              {saved ? <Check size={13} aria-hidden="true" /> : <BookmarkPlus size={13} aria-hidden="true" />}
              {saved ? 'Saved to Capture' : 'Save to Capture'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
