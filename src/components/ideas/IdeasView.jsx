// Component: IdeasView
// Purpose: Idea tracker — capture, edit, status board, ratings, goal linking, resurface
import { useState } from 'react'
import Modal       from '../ui/Modal'
import EmptyState  from '../ui/EmptyState'
import { IDEA_STATUSES, IDEA_CATEGORIES } from '../../hooks/useIdeas'

const STATUS_COLORS = {
  Raw:        'bg-amber-50  text-amber-700  border-amber-200',
  Developing: 'bg-blue-50   text-blue-700   border-blue-200',
  Action:     'bg-forest-50 text-forest-700 border-forest-200',
  Archived:   'bg-stone-100 text-stone-500  border-stone-200',
}

const CAT_COLORS = {
  Business: 'bg-blue-100 text-blue-700',    Creative: 'bg-pink-100 text-pink-700',
  Personal: 'bg-forest-100 text-forest-700', Technical: 'bg-violet-100 text-violet-700',
  Learning: 'bg-amber-100 text-amber-700',  Other: 'bg-stone-100 text-stone-600',
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

function IdeaCard({ idea, ideas, goals, onEdit }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[idea.status]}`}>
                {idea.status}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[idea.category]}`}>
                {idea.category}
              </span>
            </div>
            <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text)' }}>
              {idea.title}
            </p>
            {idea.description && (
              <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {idea.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(idea)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
              style={{ color: 'var(--text-faint)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Edit idea"
            >
              ✏️
            </button>
            <button
              onClick={() => ideas.deleteIdea(idea.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
              style={{ color: 'var(--text-faint)' }}
              onMouseOver={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
              title="Delete idea"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <StarRating stars={idea.stars} onChange={s => ideas.setStars(idea.id, s)} />
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            {expanded ? 'Less ▲' : 'More ▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-3" style={{ borderColor: 'var(--border-soft)' }}>
          <div className="flex gap-1.5 flex-wrap">
            {IDEA_STATUSES.map(s => (
              <button key={s} onClick={() => ideas.setStatus(idea.id, s)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  idea.status === s ? STATUS_COLORS[s] : 'border-stone-200 text-ink-muted hover:bg-stone-50'
                }`}>{s}</button>
            ))}
          </div>

          {goals.goals.length > 0 && (
            <div>
              <p className="text-[10px] text-ink-faint uppercase tracking-wider mb-1">Linked goal</p>
              <select
                value={idea.linkedGoalId || ''}
                onChange={e => ideas.linkGoal(idea.id, e.target.value || null)}
                className="w-full text-xs px-3 py-1.5 rounded-xl border outline-none"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="">No linked goal</option>
                {goals.goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
          )}

          <button
            onClick={() => ideas.updateIdea(idea.id, { status: 'Action' })}
            className="w-full py-2 rounded-xl text-xs font-medium border transition-colors"
            style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)', color: 'var(--accent)' }}
          >
            🚀 Mark as Action Item
          </button>
        </div>
      )}
    </div>
  )
}

// ── Shared idea form (used for both Add and Edit) ─────────────────────────────
function IdeaForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title:       initial?.title       || '',
    description: initial?.description || '',
    category:    initial?.category    || 'Other',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  const inputStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Idea title *
        </label>
        <input
          autoFocus
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder="What's the idea?"
          className="input-base w-full"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Describe it (optional)
        </label>
        <textarea
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="More details, context, why it matters..."
          rows={3}
          className="input-base w-full resize-none"
          style={inputStyle}
        />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Category</p>
        <div className="flex flex-wrap gap-2">
          {IDEA_CATEGORIES.map(c => (
            <button
              key={c} type="button"
              onClick={() => setForm(p => ({ ...p, category: c }))}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
              style={form.category === c
                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          Cancel
        </button>
        <button
          type="submit" disabled={!form.title.trim()}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {initial ? 'Save changes' : 'Save Idea'}
        </button>
      </div>
    </form>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function IdeasView({ ideas, goals }) {
  const [modal,   setModal]   = useState(false)   // 'add' | 'edit'
  const [editing, setEditing] = useState(null)
  const [filter,  setFilter]  = useState('All')

  const oldIdea = ideas.getRandomOldIdea()

  const visible = filter === 'All'
    ? ideas.ideas
    : ideas.ideas.filter(i => i.status === filter)

  const handleSubmit = (formData) => {
    if (modal === 'edit' && editing) {
      ideas.updateIdea(editing.id, formData)
    } else {
      ideas.addIdea(formData)
    }
    setModal(false); setEditing(null)
  }

  const openEdit = (idea) => { setEditing(idea); setModal('edit') }
  const openAdd  = ()     => { setEditing(null);  setModal('add')  }
  const close    = ()     => { setModal(false);    setEditing(null) }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">

      {/* Resurface banner */}
      {oldIdea && (
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
          <p className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-1">💡 Revisit — idea from 30+ days ago:</p>
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{oldIdea.title}</p>
          {oldIdea.description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{oldIdea.description}</p>}
          <div className="flex gap-2 mt-2">
            <button onClick={() => ideas.setStatus(oldIdea.id, 'Developing')}
              className="text-xs px-3 py-1.5 rounded-full text-white font-medium" style={{ backgroundColor: '#F59E0B' }}>
              Develop it →
            </button>
            <button onClick={() => ideas.setStatus(oldIdea.id, 'Archived')}
              className="text-xs px-3 py-1.5 rounded-full border font-medium" style={{ borderColor: '#FDE68A', color: '#92400E' }}>
              Archive
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{ideas.ideas.length} ideas</p>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-full text-white text-sm font-medium transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          + New Idea
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['All', ...IDEA_STATUSES].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all border"
            style={filter === f
              ? { backgroundColor: 'var(--text)', color: 'white', borderColor: 'var(--text)' }
              : { backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
            }>{f}</button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState type="default" title="No ideas yet"
          subtitle="Your next big idea is waiting. Capture it before it disappears."
          action="+ New Idea" onAction={openAdd} />
      ) : (
        <div className="space-y-3">
          {visible.map(i => (
            <IdeaCard key={i.id} idea={i} ideas={ideas} goals={goals} onEdit={openEdit} />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!modal}
        onClose={close}
        title={modal === 'edit' ? 'Edit Idea' : 'Capture an Idea'}
      >
        <IdeaForm
          initial={modal === 'edit' ? editing : null}
          onSubmit={handleSubmit}
          onCancel={close}
        />
      </Modal>
    </div>
  )
}
