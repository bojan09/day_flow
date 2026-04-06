// Component: SearchView
// Purpose: Full-text search across tasks, notes, habits, and goals
import { useState, useMemo } from 'react'

function highlight(text = '', query = '') {
  if (!query.trim()) return text
  const re   = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(re)
  return parts.map((p, i) =>
    re.test(p)
      ? <mark key={i} className="bg-forest-100 text-forest-800 rounded px-0.5">{p}</mark>
      : p
  )
}

export default function SearchView({ tasks, notes, habits, goals }) {
  const [query, setQuery] = useState('')
  const q = query.toLowerCase().trim()

  const results = useMemo(() => {
    if (!q) return []
    const out = []

    tasks.tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q))
        out.push({ type: 'Task', icon: '✅', title: t.title, sub: `${t.category} · ${t.date}`, id: t.id })
    })

    notes.notes.forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
        out.push({ type: 'Note', icon: '📝', title: n.title, sub: n.content.slice(0, 60), id: n.id })
    })

    habits.habits.forEach(h => {
      if (h.name.toLowerCase().includes(q))
        out.push({ type: 'Habit', icon: h.icon, title: h.name, sub: `Streak: ${habits.getStreak(h.id)} days`, id: h.id })
    })

    goals.goals.forEach(g => {
      if (g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q))
        out.push({ type: 'Goal', icon: '🎯', title: g.title, sub: `${g.type} · ${g.category}`, id: g.id })
    })

    return out
  }, [q, tasks.tasks, notes.notes, habits.habits, goals.goals])

  const TYPE_COLORS = {
    Task: 'bg-blue-50 text-blue-700', Note: 'bg-amber-50 text-amber-700',
    Habit: 'bg-forest-50 text-forest-700', Goal: 'bg-violet-50 text-violet-700',
  }

  return (
    <div className="max-w-2xl mx-auto pt-2 space-y-4">
      {/* Search box */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint text-lg">🔍</span>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tasks, notes, habits, goals..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-white text-ink text-sm outline-none focus:ring-2 focus:ring-forest-200 focus:border-forest-400 shadow-sm placeholder-ink-faint transition-all"
        />
        {query && (
          <button onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink text-sm transition-colors">✕</button>
        )}
      </div>

      {/* Results */}
      {!q && (
        <p className="text-center text-sm text-ink-faint italic pt-8">Start typing to search everything</p>
      )}

      {q && results.length === 0 && (
        <div className="text-center pt-12">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-sm text-ink-faint">No results for "{query}"</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50">
          <div className="px-5 py-2.5 flex items-center justify-between">
            <p className="text-xs text-ink-faint">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          </div>
          {results.map((r, i) => (
            <div key={`${r.type}-${r.id}-${i}`}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 transition-colors">
              <span className="text-xl flex-shrink-0">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink font-medium truncate">{highlight(r.title, query)}</p>
                {r.sub && (
                  <p className="text-xs text-ink-faint mt-0.5 truncate">{highlight(r.sub, query)}</p>
                )}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TYPE_COLORS[r.type] ?? 'bg-stone-100 text-stone-600'}`}>
                {r.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
