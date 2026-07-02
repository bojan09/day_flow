// Component: AffirmationsCard
// Purpose: Daily rotating affirmation + editor. CSS variables throughout.
//          Accepts plain prop when used inside CollapsibleWidget (skips own card wrapper).
import { useState } from 'react'

export default function AffirmationsCard({ affirmations, plain = false }) {
  const [editing, setEditing] = useState(false)
  const [newText, setNewText] = useState('')
  const daily = affirmations.getDailyAffirmation()

  const inputStyle = {
    backgroundColor: 'var(--bg)',
    borderColor:     'var(--border)',
    color:           'var(--text)',
  }

  const content = (
    <>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
          ✨ Today's Affirmation
        </p>
        <button
          onClick={() => setEditing(e => !e)}
          className="hover-text-accent text-xs font-medium transition-colors"
          style={{ color: 'var(--text-faint)' }}
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>

      {!editing ? (
        daily
          ? <p className="font-serif text-base leading-relaxed italic" style={{ color: 'var(--text)' }}>
              "{daily}"
            </p>
          : <div className="flex items-center justify-between">
              <span className="text-sm italic" style={{ color: 'var(--text-faint)' }}>No affirmations yet</span>
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-medium"
                style={{ color: 'var(--accent)' }}
              >Add one →</button>
            </div>
      ) : (
        <div className="space-y-2">
          {affirmations.affirmations.map((a, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <input
                value={a}
                onChange={e => affirmations.updateAffirmation(i, e.target.value)}
                className="flex-1 text-xs rounded-lg px-3 py-2 outline-none border"
                style={inputStyle}
              />
              <button
                onClick={() => affirmations.removeAffirmation(i)}
                className="hover-danger text-xs opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: 'var(--text-faint)' }}
              >✕</button>
            </div>
          ))}
          <form
            onSubmit={e => { e.preventDefault(); if (newText.trim()) { affirmations.addAffirmation(newText); setNewText('') } }}
            className="flex gap-2"
          >
            <input
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="I am..."
              className="flex-1 text-xs rounded-lg px-3 py-2 outline-none border"
              style={inputStyle}
            />
            <button
              type="submit"
              disabled={!newText.trim()}
              className="text-xs px-3 py-2 rounded-lg text-white disabled:opacity-40 transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >Add</button>
          </form>
        </div>
      )}
    </>
  )

  // When used inside CollapsibleWidget (plain=true), render content only — no card wrapper
  if (plain) return <div>{content}</div>

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {content}
    </div>
  )
}
