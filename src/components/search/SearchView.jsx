// Component: SearchView
// Purpose: Universal search — tasks, notes, habits, goals, ideas, bookmarks
import { useState, useMemo } from 'react'
import { useDebounce } from '../../hooks/useDebounce'

function highlight(text = '', query = '') {
  if (!query.trim()) return text
  const re    = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(re)
  return parts.map((p, i) => re.test(p)
    ? <mark key={i} className="[background-color:var(--accent-light)] [color:var(--accent)] rounded px-0.5">{p}</mark>
    : p)
}

const TYPE_COLORS = {
  Task: 'bg-blue-50 text-blue-700', Note: 'bg-amber-50 text-amber-700',
  Habit: '[background-color:var(--accent-light)] [color:var(--accent)]', Goal: 'bg-violet-50 text-violet-700',
  Idea: 'bg-orange-50 text-orange-700', Bookmark: 'bg-pink-50 text-pink-700',
}

export default function SearchView({ tasks, notes, habits, goals, ideas = null, bookmarks = null }) {
  const [query, setQuery] = useState('')
  const debouncedQuery   = useDebounce(query, 200)
  const q = debouncedQuery.toLowerCase().trim()

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
      if (g.title.toLowerCase().includes(q))
        out.push({ type: 'Goal', icon: '🎯', title: g.title, sub: `${g.type} · ${g.category}`, id: g.id })
    })
    ideas?.ideas.forEach(i => {
      if (i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q))
        out.push({ type: 'Idea', icon: '💡', title: i.title, sub: i.description?.slice(0, 60) || i.status, id: i.id })
    })
    bookmarks?.bookmarks.forEach(b => {
      if (b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q))
        out.push({ type: 'Bookmark', icon: '🔖', title: b.title, sub: b.url, id: b.id })
    })
    return out
  }, [q])

  return (
    <div className="max-w-2xl mx-auto pt-2 space-y-4">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 [color:var(--text-faint)] text-lg">🔍</span>
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search everything — tasks, notes, ideas, bookmarks..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border [border-color:var(--border)] [background-color:var(--surface)] [color:var(--text)] text-sm outline-none focus:ring-2 focus:ring-forest-200 shadow-sm placeholder-ink-faint transition-all" />
        {query && (
          <button onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 [color:var(--text-faint)] hover:[color:var(--text)] text-sm">✕</button>
        )}
      </div>

      {!q && <p className="text-center text-sm [color:var(--text-faint)] italic pt-8">Start typing to search everything</p>}

      {q && results.length === 0 && (
        <div className="text-center pt-12">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-sm [color:var(--text-faint)]">No results for "{query}"</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="[background-color:var(--surface)] rounded-2xl border [border-color:var(--border-soft)] shadow-sm divide-y [border-color:var(--border-soft)]">
          <div className="px-5 py-2.5">
            <p className="text-xs [color:var(--text-faint)]">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          </div>
          {results.map((r, i) => (
            <div key={`${r.type}-${r.id}-${i}`} className="flex items-center gap-3 px-5 py-3.5 hover:[background-color:var(--bg-secondary)] transition-colors">
              <span className="text-xl flex-shrink-0">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm [color:var(--text)] font-medium truncate">{highlight(r.title, query)}</p>
                {r.sub && <p className="text-xs [color:var(--text-faint)] mt-0.5 truncate">{highlight(r.sub, query)}</p>}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TYPE_COLORS[r.type] ?? '[background-color:var(--bg-secondary)] text-stone-600'}`}>
                {r.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
