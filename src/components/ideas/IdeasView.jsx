// Component: IdeasView
// Purpose: Idea tracker — capture, status board, rating, link to goals, resurface old ideas
import { useState } from 'react'
import Card         from '../ui/Card'
import Modal        from '../ui/Modal'
import EmptyState   from '../ui/EmptyState'
import { IDEA_STATUSES, IDEA_CATEGORIES } from '../../hooks/useIdeas'

const STATUS_COLORS = {
  Raw:        'bg-amber-50  text-amber-700  border-amber-200',
  Developing: 'bg-blue-50   text-blue-700   border-blue-200',
  Action:     'bg-forest-50 text-forest-700 border-forest-200',
  Archived:   'bg-stone-100 text-stone-500  border-stone-200',
}

const CAT_COLORS = {
  Business: 'bg-blue-100 text-blue-700', Creative: 'bg-pink-100 text-pink-700',
  Personal: 'bg-forest-100 text-forest-700', Technical: 'bg-violet-100 text-violet-700',
  Learning: 'bg-amber-100 text-amber-700', Other: 'bg-stone-100 text-stone-600',
}

function StarRating({ stars, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <button key={s} onClick={() => onChange(s)}
          className={`text-base transition-colors ${s <= stars ? 'text-amber-400' : 'text-stone-200 hover:text-amber-200'}`}>
          ★
        </button>
      ))}
    </div>
  )
}

function IdeaCard({ idea, ideas, goals }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[idea.status]}`}>
                {idea.status}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[idea.category]}`}>
                {idea.category}
              </span>
            </div>
            <p className="text-sm font-medium text-ink leading-snug">{idea.title}</p>
            {idea.description && (
              <p className="text-xs text-ink-muted mt-1 leading-relaxed line-clamp-2">{idea.description}</p>
            )}
          </div>
          <button onClick={() => ideas.deleteIdea(idea.id)}
            className="text-ink-faint hover:text-red-400 text-xs p-1 transition-colors flex-shrink-0">✕</button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <StarRating stars={idea.stars} onChange={s => ideas.setStars(idea.id, s)} />
          <button onClick={() => setExpanded(e => !e)}
            className="text-xs text-forest-500 hover:text-forest-700 transition-colors">
            {expanded ? 'Less ▲' : 'More ▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-stone-50 px-4 py-3 space-y-3">
          {/* Status picker */}
          <div className="flex gap-1.5 flex-wrap">
            {IDEA_STATUSES.map(s => (
              <button key={s} onClick={() => ideas.setStatus(idea.id, s)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  idea.status === s ? STATUS_COLORS[s] : 'border-stone-200 text-ink-muted hover:bg-stone-50'
                }`}>{s}</button>
            ))}
          </div>

          {/* Link to goal */}
          {goals.goals.length > 0 && (
            <div>
              <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-1">Linked goal</p>
              <select
                value={idea.linkedGoalId || ''}
                onChange={e => ideas.linkGoal(idea.id, e.target.value || null)}
                className="w-full text-xs px-3 py-1.5 rounded-xl border border-stone-200 bg-parchment outline-none text-ink"
              >
                <option value="">No linked goal</option>
                {goals.goals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Convert to task */}
          <button
            onClick={() => ideas.updateIdea(idea.id, { status: 'Action' })}
            className="w-full py-2 rounded-xl bg-forest-50 border border-forest-200 text-forest-700 text-xs font-medium hover:bg-forest-100 transition-colors"
          >
            🚀 Mark as Action Item
          </button>
        </div>
      )}
    </div>
  )
}

export default function IdeasView({ ideas, goals }) {
  const [modal,     setModal]     = useState(false)
  const [filter,    setFilter]    = useState('All')
  const [form,      setForm]      = useState({ title: '', description: '', category: 'Other' })
  const oldIdea                   = ideas.getRandomOldIdea()

  const visible = filter === 'All'
    ? ideas.ideas
    : ideas.ideas.filter(i => i.status === filter)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    ideas.addIdea(form)
    setForm({ title: '', description: '', category: 'Other' })
    setModal(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      {/* Resurface old idea */}
      {oldIdea && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-1">💡 Resurface — you had this idea 30+ days ago:</p>
          <p className="text-sm font-medium text-ink">{oldIdea.title}</p>
          {oldIdea.description && <p className="text-xs text-ink-muted mt-0.5">{oldIdea.description}</p>}
          <div className="flex gap-2 mt-2">
            <button onClick={() => ideas.setStatus(oldIdea.id, 'Developing')}
              className="text-xs px-3 py-1.5 rounded-full bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors">
              Develop it →
            </button>
            <button onClick={() => ideas.setStatus(oldIdea.id, 'Archived')}
              className="text-xs px-3 py-1.5 rounded-full border border-amber-200 text-amber-600 hover:bg-amber-100 transition-colors">
              Archive
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{ideas.ideas.length} ideas</p>
        <button onClick={() => setModal(true)}
          className="px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors">
          + New Idea
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['All', ...IDEA_STATUSES].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all border ${
              filter === f ? 'bg-ink text-white border-ink' : 'bg-white border-stone-200 text-ink-muted hover:border-stone-300'
            }`}>{f}</button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState type="default" title="No ideas yet"
          subtitle="Your next big idea is waiting. Capture it before it disappears."
          action="+ New Idea" onAction={() => setModal(true)} />
      ) : (
        <div className="space-y-3">
          {visible.map(i => <IdeaCard key={i.id} idea={i} ideas={ideas} goals={goals} />)}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Capture an Idea">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1.5">Idea title</label>
            <input autoFocus value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="What's the idea?"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-parchment text-sm text-ink outline-none focus:ring-2 focus:ring-forest-200 placeholder-ink-faint/50" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1.5">Describe it (optional)</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="More details, context, why it matters..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-parchment text-sm text-ink outline-none resize-none focus:ring-2 focus:ring-forest-200 placeholder-ink-faint/50" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {IDEA_CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, category: c }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    form.category === c ? 'bg-ink text-white border-ink' : 'border-stone-200 text-ink-muted hover:bg-stone-50'
                  }`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-ink-muted hover:bg-stone-50">Cancel</button>
            <button type="submit" disabled={!form.title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-40">Save Idea</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
