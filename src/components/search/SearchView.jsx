// Component: SearchView
// Purpose: Universal search with two modes:
//          1. Keyword search (instant, local, debounced 200ms)
//          2. AI natural language search ("show me gym stuff last week")
//             — sends context to Claude, returns ranked results
import { useState, useMemo } from 'react'
import { callClaude } from '../../services/aiService'
import { useDebounce }       from '../../hooks/useDebounce'
import { subDays, format }   from 'date-fns'
import { getDateKey }        from '../../utils/dateUtils'

// ── Highlight matching text ────────────────────────────────────────────────────
function highlight(text = '', query = '') {
  if (!query.trim()) return text
  const re    = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(re)
  return parts.map((p, i) =>
    re.test(p)
      ? <mark key={i} className="rounded px-0.5"
          style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>{p}</mark>
      : p
  )
}

const TYPE_PILL = {
  Task:     { bg: '#EFF6FF', color: '#1D4ED8' },
  Note:     { bg: '#FFFBEB', color: '#92400E' },
  Habit:    { bg: 'var(--accent-light)', color: 'var(--accent)' },
  Goal:     { bg: '#F5F3FF', color: '#5B21B6' },
  Idea:     { bg: '#FFF7ED', color: '#C2410C' },
  Bookmark: { bg: '#FDF2F8', color: '#86198F' },
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
      className="flex items-start gap-3 px-4 py-3 rounded-2xl border transition-all card-hover"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
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
export default function SearchView({ tasks, notes, habits, goals, ideas, bookmarks }) {
  const [query,    setQuery]    = useState('')
  const [mode,     setMode]     = useState('keyword') // 'keyword' | 'ai'
  const [aiResult, setAiResult] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const debouncedQuery = useDebounce(query, 200)
  const q = debouncedQuery.toLowerCase().trim()

  const corpus = useMemo(() => buildCorpus({ tasks, notes, habits, goals, ideas, bookmarks }), [
    tasks, notes, habits, goals, ideas, bookmarks,
  ])

  // ── Keyword results ───────────────────────────────────────────────────────────
  const keywordResults = useMemo(() => {
    if (!q || mode !== 'keyword') return []
    return corpus.filter(item => item.searchText.includes(q)).slice(0, 40)
  }, [corpus, q, mode])

  // ── AI natural language search ────────────────────────────────────────────────
  const runAiSearch = async () => {
    if (!query.trim()) return
    setLoading(true); setError(null); setAiResult([])

    // Build a compact index to send to the AI
    const index = corpus.map((item, i) => `[${i}] ${item.type}: ${item.title}${item.date ? ` (${item.date})` : ''}`).join('\n')

    try {
      const text = (await callClaude(`You are a search engine for a personal productivity app. 
The user gives a natural language query. You get an index of all their data.
Return ONLY a JSON array of the index numbers that match the query, ordered by relevance.
Example response: [3, 17, 42, 8]
Return at most 15 results. Return [] if nothing matches. No explanation, just the JSON array.`, `Query: "${query}"\n\nData index:\n${index.slice(0, 6000)}`)) || '[]'
      // text already resolved by callClaude
      const indices = JSON.parse(text.replace(/```json|```/g, '').trim())
      setAiResult(indices.map(i => corpus[i]).filter(Boolean))
    } catch (err) {
      setError('AI search failed. Try keyword mode or check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const results       = mode === 'ai' ? aiResult : keywordResults
  const showEmpty     = (mode === 'keyword' ? q : query.trim()) && !loading && results.length === 0

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
            onChange={e => { setQuery(e.target.value); if (mode === 'ai') setAiResult([]) }}
            onKeyDown={e => { if (e.key === 'Enter' && mode === 'ai') runAiSearch() }}
            placeholder={mode === 'keyword' ? 'Search everything…' : 'Ask anything — "gym last week", "urgent work tasks"…'}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text)' }}
          />
          {query && (
            <button aria-label="Clear search" type="button" onClick={() => { setQuery(''); setAiResult([]) }}
              className="tap-target text-sm flex-shrink-0" style={{ color: 'var(--text-faint)' }}>✕</button>
          )}
        </div>
        {mode === 'ai' && (
          <button type="button" onClick={runAiSearch} disabled={!query.trim() || loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0 disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}>
            {loading ? '…' : 'Search'}
          </button>
        )}
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {[
          { id: 'keyword', label: '⚡ Instant', desc: 'Keyword match' },
          { id: 'ai',      label: '✦ AI Search', desc: 'Natural language' },
        ].map(m => (
          <button type="button" key={m.id}
            onClick={() => { setMode(m.id); setAiResult([]) }}
            className="flex-1 flex flex-col items-center py-2 rounded-xl text-xs font-medium transition-all"
            style={mode === m.id
              ? { backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)', color: 'var(--text)' }
              : { color: 'var(--text-faint)' }
            }>
            <span>{m.label}</span>
            <span className="text-[10px] opacity-70">{m.desc}</span>
          </button>
        ))}
      </div>

      {/* AI search hint */}
      {mode === 'ai' && !query && (
        <div className="space-y-1.5">
          <p className="text-xs px-1" style={{ color: 'var(--text-faint)' }}>Try asking:</p>
          {[
            '"Show everything about my gym workouts"',
            '"Urgent tasks from last week"',
            '"Notes I wrote about work"',
            '"Goals I haven\'t started"',
          ].map(hint => (
            <button type="button" key={hint}
              onClick={() => setQuery(hint.replace(/"/g, ''))}
              className="w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--surface)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface)'}>
              {hint}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6">
          <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--accent)' }} />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Searching with AI…
          </span>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-center text-red-500 px-4">{error}</p>}

      {/* Results count */}
      {results.length > 0 && (
        <p className="text-xs px-1" style={{ color: 'var(--text-faint)' }}>
          {results.length} result{results.length !== 1 ? 's' : ''}
          {mode === 'ai' ? ' · AI ranked' : ''}
        </p>
      )}

      {/* Results */}
      <div className="space-y-2">
        {results.map((item, i) => (
          <ResultCard key={`${item.type}-${item.id}-${i}`} item={item} query={mode === 'keyword' ? q : ''} />
        ))}
      </div>

      {/* Empty state */}
      {showEmpty && (
        <div className="text-center py-10">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>No results found</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
            {mode === 'ai' ? 'Try rephrasing your question' : 'Try different keywords or switch to AI search'}
          </p>
        </div>
      )}

      {/* Empty prompt */}
      {!query && mode === 'keyword' && (
        <p className="text-center text-sm py-8 italic" style={{ color: 'var(--text-faint)' }}>
          Start typing to search tasks, notes, habits, goals, ideas and bookmarks
        </p>
      )}
    </div>
  )
}
