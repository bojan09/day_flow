// Component: AffirmationsCard
// Purpose: Daily rotating affirmation display + editor for the Today tab
import { useState } from 'react'
import Card from '../ui/Card'

export default function AffirmationsCard({ affirmations }) {
  const [editing, setEditing] = useState(false)
  const [newText, setNewText] = useState('')
  const daily = affirmations.getDailyAffirmation()

  if (!daily && !editing) return (
    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-stone-100 shadow-sm">
      <span className="text-sm text-ink-faint italic">No affirmations yet</span>
      <button onClick={() => setEditing(true)}
        className="text-xs text-forest-500 hover:text-forest-700 font-medium transition-colors">Add one →</button>
    </div>
  )

  return (
    <Card className="bg-gradient-to-br from-forest-50 to-parchment border-forest-100">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wider text-forest-600">✨ Today's Affirmation</p>
        <button onClick={() => setEditing(e => !e)}
          className="text-xs text-forest-400 hover:text-forest-600 transition-colors">
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>

      {!editing ? (
        <p className="font-serif text-base text-forest-900 leading-relaxed italic">"{daily}"</p>
      ) : (
        <div className="space-y-3">
          {/* Current list */}
          <div className="space-y-2">
            {affirmations.affirmations.map((a, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <input
                  value={a}
                  onChange={e => affirmations.updateAffirmation(i, e.target.value)}
                  className="flex-1 text-xs bg-white/70 border border-forest-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-forest-300 text-ink"
                />
                <button onClick={() => affirmations.removeAffirmation(i)}
                  className="text-forest-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all">✕</button>
              </div>
            ))}
          </div>
          {/* Add new */}
          <form onSubmit={e => { e.preventDefault(); affirmations.addAffirmation(newText); setNewText('') }}
            className="flex gap-2">
            <input value={newText} onChange={e => setNewText(e.target.value)}
              placeholder="I am..."
              className="flex-1 text-xs bg-white/70 border border-forest-200 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-forest-300 text-ink placeholder-forest-300/60" />
            <button type="submit" disabled={!newText.trim()}
              className="text-xs px-3 py-1.5 rounded-lg bg-forest-500 text-white disabled:opacity-40 transition-colors">Add</button>
          </form>
        </div>
      )}
    </Card>
  )
}
