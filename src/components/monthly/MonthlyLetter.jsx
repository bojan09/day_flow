// Component: MonthlyLetter
// Purpose: 1st-of-month letter prompt + browsable archive of past letters
import { useState } from 'react'
import { format } from 'date-fns'
import Card from '../ui/Card'

export default function MonthlyLetter({ monthlyLetter }) {
  const [writing, setWriting]   = useState(monthlyLetter.shouldPrompt)
  const [content, setContent]   = useState('')
  const [view,    setView]      = useState('prompt') // 'prompt' | 'archive'
  const [saved,   setSaved]     = useState(false)
  const letters                  = monthlyLetter.getAllLetters()
  const current                  = monthlyLetter.getCurrentLetter()

  const handleSave = () => {
    if (!content.trim()) return
    monthlyLetter.saveLetter(content)
    setSaved(true)
    setWriting(false)
  }

  if (view === 'archive') {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium uppercase tracking-wider [color:var(--text-faint)]">📬 Monthly Letters</p>
          <button onClick={() => setView('prompt')}
            className="text-xs [color:var(--accent)] hover:[color:var(--accent)] transition-colors">← Back</button>
        </div>
        {letters.length === 0 ? (
          <p className="text-sm [color:var(--text-faint)] italic text-center py-4">No letters yet.</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
            {letters.map(l => (
              <div key={l.month} className="border [border-color:var(--border-soft)] rounded-xl p-4">
                <p className="text-xs font-medium [color:var(--accent)] mb-2">
                  {format(new Date(l.month + '-01'), 'MMMM yyyy')}
                </p>
                <p className="text-sm [color:var(--text-muted)] leading-relaxed font-serif italic whitespace-pre-wrap">
                  {l.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    )
  }

  if (writing && !current) {
    return (
      <Card className="border-forest-100 [background-color:var(--accent-light)]">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider [color:var(--accent)] mb-0.5">📬 Monthly Letter</p>
            <p className="text-sm [color:var(--accent)] font-serif">
              It's a new month — write a letter to yourself.
            </p>
          </div>
          <button onClick={() => setWriting(false)}
            className="text-xs [color:var(--accent)] hover:[color:var(--accent)] transition-colors">Skip</button>
        </div>
        <p className="text-xs [color:var(--accent)] italic mb-3">
          What happened last month? What are you proud of? What do you want next month to feel like?
        </p>
        <textarea
          autoFocus
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Dear future me..."
          rows={5}
          className="w-full text-sm [background-color:var(--surface)] border [border-color:var(--accent-mid)] rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-forest-300 [color:var(--text)] placeholder-forest-300/60 font-serif leading-relaxed"
        />
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className="mt-3 w-full py-2.5 rounded-xl [background-color:var(--accent)] text-white text-sm font-medium hover:[background-color:var(--accent)] disabled:opacity-40 transition-colors"
        >
          Seal & Save Letter
        </button>
      </Card>
    )
  }

  if (current || letters.length > 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3 [background-color:var(--surface)] rounded-xl border [border-color:var(--border-soft)] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-base">📬</span>
          <span className="text-sm [color:var(--text-muted)]">
            {current
              ? `Letter written for ${format(new Date(monthlyLetter.currentMonthKey + '-01'), 'MMMM')}`
              : `${letters.length} letter${letters.length !== 1 ? 's' : ''} in your archive`}
          </span>
        </div>
        <button
          onClick={() => setView('archive')}
          className="text-xs [color:var(--accent)] hover:[color:var(--accent)] font-medium transition-colors"
        >
          View archive →
        </button>
      </div>
    )
  }

  return null
}
