// Component: MoodTracker
// Purpose: Daily mood check-in — large emoji tap targets (56px), CSS variables, optional note.
import { useState } from 'react'
import { MOODS } from '../../hooks/useMood'

export default function MoodTracker({ mood }) {
  const today    = mood.getTodayMood()
  const [note,     setNote]     = useState(today?.note  ?? '')
  const [selected, setSelected] = useState(today?.score ?? null)
  const [saved,    setSaved]    = useState(!!today)

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
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
        How are you feeling today?
      </p>

      {/* Mood buttons — 56px min height for comfortable tapping */}
      <div className="flex justify-between gap-1.5 mb-4">
        {MOODS.map(m => {
          const active = selected === m.score
          return (
            <button
              key={m.score}
              onClick={() => handleSelect(m.score)}
              title={m.label}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-all border active:scale-95"
              style={{
                minHeight:       '64px',
                backgroundColor: active ? 'var(--accent-light)' : 'var(--bg-secondary)',
                borderColor:     active ? 'var(--accent-mid)'   : 'var(--border)',
                transform:       active ? 'scale(1.05)'         : 'scale(1)',
              }}
              aria-pressed={active}
            >
              <span className="text-2xl leading-none">{m.emoji}</span>
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? 'var(--accent)' : 'var(--text-faint)' }}
              >{m.label}</span>
            </button>
          )
        })}
      </div>

      {/* Already saved — show current mood */}
      {saved && today && (
        <div
          className="flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
        >
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Mood logged ✓
            {today.note && ` · "${today.note}"`}
          </span>
          <button
            onClick={() => setSaved(false)}
            className="text-xs"
            style={{ color: 'var(--accent)' }}
          >Edit</button>
        </div>
      )}

      {/* Note + save — only show when selecting/editing */}
      {selected && !saved && (
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note about your day… (optional)"
            rows={2}
            className="w-full text-sm rounded-xl px-4 py-2.5 outline-none resize-none border"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor:     'var(--border)',
              color:           'var(--text)',
            }}
          />
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: 'var(--accent)', minHeight: '48px' }}
          >
            Save mood
          </button>
        </div>
      )}
    </div>
  )
}
