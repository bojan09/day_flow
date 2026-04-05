// Component: MoodTracker
// Purpose: Daily mood check-in card — emoji selector + optional note
import { useState } from 'react'
import Card from '../ui/Card'
import { MOODS } from '../../hooks/useMood'

export default function MoodTracker({ mood }) {
  const today   = mood.getTodayMood()
  const [note, setNote]       = useState(today?.note ?? '')
  const [selected, setSelected] = useState(today?.score ?? null)
  const [saved, setSaved]     = useState(!!today)

  const handleSelect = (score) => {
    setSelected(score)
    setSaved(false)
  }

  const handleSave = () => {
    if (!selected) return
    mood.setTodayMood(selected, note)
    setSaved(true)
  }

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-3">
        How are you feeling today?
      </p>

      {/* Mood buttons */}
      <div className="flex justify-between gap-1 mb-4">
        {MOODS.map(m => (
          <button
            key={m.score}
            onClick={() => handleSelect(m.score)}
            title={m.label}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all border ${
              selected === m.score
                ? 'bg-forest-50 border-forest-300 scale-105 shadow-sm'
                : 'border-stone-100 hover:bg-stone-50 hover:border-stone-200'
            }`}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-[10px] text-ink-faint font-medium">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Note field */}
      {selected && !saved && (
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note about your day... (optional)"
            rows={2}
            className="w-full text-sm bg-parchment border border-stone-200 rounded-xl px-3 py-2 outline-none resize-none focus:ring-2 focus:ring-forest-200 focus:border-forest-400 text-ink placeholder-ink-faint/50 transition-all"
          />
          <button
            onClick={handleSave}
            className="w-full py-2 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors"
          >
            Save Mood
          </button>
        </div>
      )}

      {/* Saved state */}
      {saved && today && (
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="text-xl">{MOODS.find(m => m.score === today.score)?.emoji}</span>
          <span className="italic font-serif text-base">
            {today.note || `Feeling ${MOODS.find(m => m.score === today.score)?.label?.toLowerCase()}`}
          </span>
          <button
            onClick={() => setSaved(false)}
            className="ml-auto text-xs text-ink-faint hover:text-ink transition-colors"
          >
            Edit
          </button>
        </div>
      )}
    </Card>
  )
}
