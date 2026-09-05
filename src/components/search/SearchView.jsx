// Component: SearchView
// Purpose: Universal search with two modes:
//          1. Keyword search (instant, local, debounced 200ms)
//          2. AI natural language search ("show me gym stuff last week")
//             — sends context to Claude, returns ranked results
import { useState, useMemo } from 'react'
import { useDebounce }       from '../../hooks/useDebounce'
import { useBookmarks }      from '../../hooks/useBookmarks'


// ── Highlight matching text ────────────────────────────────────────────────────
function highlight(text = '', query = '') {
  if (!query.trim()) return text
  const re    = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(re)
  return parts.map((p, i) =>
    re.test(p)
      ? <mark key={i} className="rounded px-0.5"
          style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)' }}>{p}</mark>
      : p
  )
}

const TYPE_PILL = {
  Task:     { bg: 'var(--tone-blue-bg)', color: 'var(--tone-blue-text)' },
  Note:     { bg: 'var(--tone-amber-bg)', color: 'var(--tone-amber-text)' },
  Habit:    { bg: 'var(--accent-light)', color: 'var(--accent-text)' },
  Goal:     { bg: 'var(--tone-violet-bg)', color: 'var(--tone-violet-text)' },
  Idea:     { bg: 'var(--tone-orange-bg)', color: 'var(--tone-orange-text)' },
  Bookmark: { bg: 'var(--tone-pink-bg)', color: 'var(--tone-pink-text)' },
}

// ── Build flat search corpus ────────────────────────────────────────────────────
function buildCorpus({ tasks, notes, habits, goals, ideas, bookmarks }) {
  const out = []
  tasks?.tasks.forEach(t => out.push({
    type: 'Task', icon: '✅', id: t.id,
    title: t.title, sub: `${t.category} · ${t.date}`,
    searchText: `${t.title} ${t.category} ${t.date} ${t.notes || ''}`.toLowerCase(),
    date: t.date,
  }))
  notes?.notes.forEach(n => out.push({
    type: 'Note', icon: '📝', id: n.id,
    title: n.title, sub: n.content?.slice(0, 60),
    searchText: `${n.title} ${n.content || ''}`.toLowerCase(),
    date: n.createdAt?.split('T')[0],
  }))
  habits?.habits.forEach(h => out.push({
    type: 'Habit', icon: h.icon, id: h.id,
    title: h.name, sub: `Streak: ${habits.getStreak(h.id)}d`,
    searchText: h.name.toLowerCase(),
  }))
  goals?.goals.forEach(g => out.push({
    type: 'Goal', icon: '🏆', id: g.id,
    title: g.title, sub: g.type,
    searchText: `${g.title} ${g.type}`.toLowerCase(),
  }))
  ideas?.ideas?.forEach(i => out.push({
    type: 'Idea', icon: '💡', id: i.id,
    title: i.title, sub: i.description?.slice(0, 60),
    searchText: `${i.title} ${i.description || ''}`.toLowerCase(),
  }))
  bookmarks?.bookmarks?.forEach(b => out.push({
    type: 'Bookmark', icon: '🔖', id: b.id,
    title: b.title || b.url, sub: b.url,
    searchText: `${b.title || ''} ${b.url || ''} ${b.note || ''}`.toLowerCase(),
  }))
  return out
}

// ── Result card ─────────────────────────────────────────────────────────────────
function ResultCard({ item, query }) {
  const pill = TYPE_PILL[item.type] || TYPE_PILL.Task
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-2xl transition-all card-hover"
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
          {query ? highlight(item.title, query) : item.title}
        </p>
        {item.sub && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-faint)' }}>
            {query ? highlight(item.sub, query) : item.sub}
          </p>
        )}
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-semibold"
        style={{ backgroundColor: pill.bg, color: pill.color }}>
        {item.type}
      </span>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────────
export default function SearchView({ tasks, notes, habits, goals, ideas }) {
  // Owned here rather than at the DashboardPage root — see CaptureView.
  const bookmarks = useBookmarks()
  const [query,    setQuery]    = useState('')
  const debouncedQuery = useDebounce(query, 200)
  const q = debouncedQuery.toLowerCase().trim()

  const corpus = useMemo(() => buildCorpus({ tasks, notes, habits, goals, ideas, bookmarks }), [
    tasks, notes, habits, goals, ideas, bookmarks,
  ])

  // ── Keyword results ───────────────────────────────────────────────────────────
  const keywordResults = useMemo(() => {
    if (!q) return []
    return corpus.filter(item => item.searchText.includes(q)).slice(0, 40)
  }, [corpus, q])

  const results       = keywordResults
  const showEmpty     = q && results.length === 0

  return (
    <div className="max-w-2xl mx-auto pt-2 space-y-3">

      {/* Search bar */}
      <div
        className="flex gap-2 p-1.5 rounded-2xl border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex-1 flex items-center gap-2 px-3">
          <span className="text-lg">🔍</span>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Search everything…'
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text)' }}
          />
          {query && (
            <button aria-label="Clear search" type="button" onClick={() => setQuery('')}
              className="tap-target text-sm flex-shrink-0" style={{ color: 'var(--text-faint)' }}>✕</button>
          )}
        </div>
      </div>

      {/* Results count */}
      {results.length > 0 && (
        <p className="text-xs px-1" style={{ color: 'var(--text-faint)' }}>
          {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Results */}
      <div className="space-y-2">
        {results.map((item, i) => (
          <ResultCard key={`${item.type}-${item.id}-${i}`} item={item} query={q} />
        ))}
      </div>

      {/* Empty state */}
      {showEmpty && (
        <div className="text-center py-10">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>No results found</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
            Try different keywords
          </p>
        </div>
      )}

      {/* Empty prompt */}
      {!query && (
        <p className="text-center text-sm py-8 italic" style={{ color: 'var(--text-faint)' }}>
          Start typing to search tasks, notes, habits, goals, ideas and bookmarks
        </p>
      )}
    </div>
  )
}
