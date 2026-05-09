// Component: ChallengesView
// Purpose: Challenges tab — create/edit/delete challenges with emoji, recurrence, progress tracking.
import { useState } from 'react'
import { format, addDays } from 'date-fns'
import Modal       from '../ui/Modal'
import EmptyState  from '../ui/EmptyState'
import EmojiPicker from '../ui/EmojiPicker'
import { CHALLENGE_PRESETS, RECURRENCE_OPTIONS } from '../../hooks/useChallenges'
import { getTodayKey } from '../../utils/dateUtils'

// ── Challenge card ────────────────────────────────────────────────────────────
function ChallengeCard({ c, challenges, onEdit }) {
  const progress     = challenges.getProgress(c)
  const daysLeft     = challenges.getDaysLeft(c)
  const completedDays = challenges.getCompletedDays(c.id)
  const today        = getTodayKey()
  const doneTodayAlready = challenges.isDayDone(c.id, today)

  // Build last 7 day dots
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i - 6)
    const key = format(d, 'yyyy-MM-dd')
    return { key, done: challenges.isDayDone(c.id, key), isToday: key === today }
  })

  return (
    <div
      className="rounded-2xl border overflow-hidden card-hover"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{c.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{c.title}</p>
                {c.description && (
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{c.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                    {c.days}-day challenge
                  </span>
                  {c.recurrence !== 'none' && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
                    >
                      🔁 {c.recurrence}
                    </span>
                  )}
                  <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    {daysLeft} days left
                  </span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => onEdit(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
                  style={{ color: 'var(--text-faint)' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="Edit challenge"
                >✏️</button>
                <button
                  onClick={() => challenges.deleteChallenge(c.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
                  style={{ color: 'var(--text-faint)' }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
                  title="Delete"
                >✕</button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{completedDays}/{c.days} days</span>
                <span className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
                />
              </div>
            </div>

            {/* Last 7 day dots */}
            <div className="flex gap-1 mt-2.5">
              {last7.map(d => (
                <div
                  key={d.key}
                  className="flex-1 h-5 rounded-md flex items-center justify-center text-[9px] transition-all"
                  style={{
                    backgroundColor: d.done ? 'var(--accent)' : 'var(--bg-secondary)',
                    outline: d.isToday ? '1.5px solid var(--accent-mid)' : 'none',
                    color: d.done ? 'white' : 'var(--text-faint)',
                  }}
                  title={d.key}
                >
                  {d.done ? '✓' : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log today button */}
      <div className="px-4 pb-4">
        <button
          onClick={() => challenges.toggleDay(c.id)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border"
          style={doneTodayAlready
            ? { backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)', color: 'var(--accent)' }
            : { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
          }
        >
          {doneTodayAlready ? '✓ Logged today' : '+ Log today'}
        </button>
      </div>
    </div>
  )
}

// ── Challenge form (create + edit) ────────────────────────────────────────────
function ChallengeForm({ initial, onSubmit, onCancel }) {
  const [title,       setTitle]       = useState(initial?.title       || '')
  const [emoji,       setEmoji]       = useState(initial?.emoji       || '🎯')
  const [description, setDescription] = useState(initial?.description || '')
  const [days,        setDays]        = useState(initial?.days        || 7)
  const [recurrence,  setRecurrence]  = useState(initial?.recurrence  || 'none')
  const [showEmoji,   setShowEmoji]   = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({ title: title.trim(), emoji, description, days, recurrence })
  }

  const inputStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Emoji + Title */}
      <div className="flex gap-3 items-start">
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowEmoji(v => !v)}
            className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all"
            style={{ borderColor: showEmoji ? 'var(--accent)' : 'var(--border)', backgroundColor: 'var(--bg)' }}
          >
            {emoji}
          </button>
          {showEmoji && (
            <div className="absolute top-14 left-0 z-30">
              <EmojiPicker value={emoji} onChange={setEmoji} onClose={() => setShowEmoji(false)} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Challenge name *
          </label>
          <input
            autoFocus value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Walk every day"
            className="input-base w-full" style={inputStyle}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Description (optional)
        </label>
        <textarea
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="What's the goal? Why does it matter?"
          rows={2} className="input-base w-full resize-none" style={inputStyle}
        />
      </div>

      {/* Duration */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>
          Duration
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[7, 14, 21, 30].map(d => (
            <button
              key={d} type="button" onClick={() => setDays(d)}
              className="py-2 rounded-xl text-sm font-medium transition-all border"
              style={days === d
                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
              }
            >{d} days</button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Custom:</span>
          <input
            type="number" min="1" max="365" value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="w-20 text-sm px-3 py-1.5 rounded-xl border outline-none"
            style={inputStyle}
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>days</span>
        </div>
      </div>

      {/* Recurrence */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>
          Recurrence
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RECURRENCE_OPTIONS.map(opt => (
            <button
              key={opt.id} type="button" onClick={() => setRecurrence(opt.id)}
              className="py-2 rounded-xl text-sm font-medium transition-all border"
              style={recurrence === opt.id
                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
              }
            >{opt.label}</button>
          ))}
        </div>
        {recurrence !== 'none' && (
          <p className="text-xs mt-2 italic" style={{ color: 'var(--text-faint)' }}>
            Challenge will automatically restart after completion.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Cancel
        </button>
        <button type="submit" disabled={!title.trim()}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)' }}>
          {initial ? 'Save changes' : 'Start challenge'}
        </button>
      </div>
    </form>
  )
}

// ── Main view ──────────────────────────────────────────────────────────────────
export default function ChallengesView({ challenges }) {
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)

  const openAdd  = ()      => { setEditing(null);    setModal(true) }
  const openEdit = (c)     => { setEditing(c);       setModal(true) }
  const close    = ()      => { setModal(false);     setEditing(null) }

  const handleSubmit = (data) => {
    if (editing) challenges.updateChallenge(editing.id, data)
    else         challenges.startChallenge(data)
    close()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {challenges.active.length} active · {challenges.archived.length} completed
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-full text-white text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          + New Challenge
        </button>
      </div>

      {/* Presets */}
      {challenges.challenges.length === 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-faint)' }}>
            Quick start
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CHALLENGE_PRESETS.slice(0, 4).map(p => (
              <button
                key={p.title}
                onClick={() => challenges.startChallenge(p)}
                className="flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all active:scale-95 text-left"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-mid)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <span className="text-xl flex-shrink-0">{p.emoji}</span>
                <span className="truncate">{p.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active */}
      {challenges.active.length === 0 && challenges.challenges.length > 0 ? (
        <EmptyState type="default" title="No active challenges" subtitle="Start a new challenge to build discipline." action="+ New Challenge" onAction={openAdd} />
      ) : (
        <div className="space-y-3">
          {challenges.active.map(c => (
            <ChallengeCard key={c.id} c={c} challenges={challenges} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* Archived */}
      {challenges.archived.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-faint)' }}>
            Completed
          </p>
          <div className="space-y-2">
            {challenges.archived.map(c => (
              <div key={c.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border opacity-60"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <span className="text-lg">{c.emoji}</span>
                <span className="text-sm flex-1" style={{ color: 'var(--text-muted)' }}>{c.title}</span>
                <span className="text-xs" style={{ color: 'var(--accent)' }}>✓ Done</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={modal} onClose={close} title={editing ? 'Edit Challenge' : 'New Challenge'}>
        <ChallengeForm initial={editing} onSubmit={handleSubmit} onCancel={close} />
      </Modal>
    </div>
  )
}
