// Component: BookmarksView
// Purpose: Save URLs with title, tags, read/unread state, and notes
import { useState } from 'react'
import Card  from '../ui/Card'
import Modal from '../ui/Modal'
import EmptyState from '../ui/EmptyState'
import { BOOKMARK_TAGS } from '../../hooks/useBookmarks'

function BookmarkCard({ b, bookmarks }) {
  const domain = (() => { try { return new URL(b.url).hostname.replace('www.', '') } catch { return b.url } })()

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${b.read ? 'opacity-60 border-stone-100' : 'border-stone-100'}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-xs text-ink-muted flex-shrink-0 font-medium">
          {domain[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <a href={b.url} target="_blank" rel="noopener noreferrer"
            className="text-sm font-medium text-ink hover:text-forest-600 transition-colors line-clamp-1">
            {b.title}
          </a>
          <p className="text-[11px] text-ink-faint mt-0.5">{domain}</p>
          {b.note && <p className="text-xs text-ink-muted mt-1 italic line-clamp-2">{b.note}</p>}
          {b.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {b.tags.map(t => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded-full">#{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button onClick={() => bookmarks.toggleRead(b.id)}
            className={`text-[10px] px-2 py-1 rounded-full border font-medium transition-all ${
              b.read ? 'bg-stone-100 text-stone-500 border-stone-200' : 'bg-forest-50 text-forest-700 border-forest-200 hover:bg-forest-100'
            }`}>{b.read ? 'Read ✓' : 'Unread'}</button>
          <button onClick={() => bookmarks.deleteBookmark(b.id)}
            className="text-ink-faint hover:text-red-400 text-xs p-0.5 transition-colors text-center">✕</button>
        </div>
      </div>
    </div>
  )
}

export default function BookmarksView({ bookmarks }) {
  const [modal,   setModal]   = useState(false)
  const [filter,  setFilter]  = useState('all')
  const [tagFilter, setTag]   = useState(null)
  const [form,    setForm]    = useState({ url: '', title: '', note: '', tags: [] })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleFormTag = (t) => set('tags', form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.url.trim()) return
    bookmarks.addBookmark(form)
    setForm({ url: '', title: '', note: '', tags: [] })
    setModal(false)
  }

  const visible = bookmarks.bookmarks
    .filter(b => filter === 'unread' ? !b.read : filter === 'read' ? b.read : true)
    .filter(b => !tagFilter || b.tags.includes(tagFilter))

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {bookmarks.unread.length} unread · {bookmarks.bookmarks.length} total
        </p>
        <button onClick={() => setModal(true)}
          className="px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors">
          + Save Link
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {[['all','All'],['unread','Unread'],['read','Read']].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all border ${
              filter === id ? 'bg-ink text-white border-ink' : 'bg-white border-stone-200 text-ink-muted hover:border-stone-300'
            }`}>{label}</button>
        ))}
        <div className="w-px bg-stone-200 self-stretch mx-1" />
        {BOOKMARK_TAGS.map(t => (
          <button key={t} onClick={() => setTag(tagFilter === t ? null : t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all border ${
              tagFilter === t ? 'bg-forest-500 text-white border-forest-500' : 'border-stone-200 text-ink-muted hover:bg-stone-50'
            }`}>#{t}</button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState type="default" title="No bookmarks"
          subtitle="Save articles, tools, and resources to read later."
          action="+ Save Link" onAction={() => setModal(true)} />
      ) : (
        <div className="space-y-3">
          {visible.map(b => <BookmarkCard key={b.id} b={b} bookmarks={bookmarks} />)}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Save Bookmark">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1.5">URL</label>
            <input autoFocus value={form.url} onChange={e => set('url', e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-parchment text-sm text-ink outline-none focus:ring-2 focus:ring-forest-200" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1.5">Title (optional)</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Descriptive title..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-parchment text-sm text-ink outline-none focus:ring-2 focus:ring-forest-200" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1.5">Note (optional)</label>
            <input value={form.note} onChange={e => set('note', e.target.value)}
              placeholder="Why are you saving this?"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-parchment text-sm text-ink outline-none focus:ring-2 focus:ring-forest-200" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {BOOKMARK_TAGS.map(t => (
                <button key={t} type="button" onClick={() => toggleFormTag(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    form.tags.includes(t) ? 'bg-forest-500 text-white border-forest-500' : 'border-stone-200 text-ink-muted hover:bg-stone-50'
                  }`}>#{t}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-ink-muted hover:bg-stone-50">Cancel</button>
            <button type="submit" disabled={!form.url.trim()}
              className="flex-1 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-40">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
