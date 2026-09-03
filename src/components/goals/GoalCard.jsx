// Component: GoalCard
// Purpose: Single goal — progress ring, milestones, inline edit modal.
import { useState, memo } from 'react'
import { useToast } from '../../utils/toast'
import Modal from '../ui/Modal'
import { GOAL_TYPES, GOAL_CATEGORIES } from '../../hooks/useGoals'

const CAT_COLORS = {
  Career:        { bg: '#EFF6FF', text: '#1D4ED8' },
  Health:        { bg: '#F0FDF4', text: '#166534' },
  Learning:      { bg: '#F5F3FF', text: '#5B21B6' },
  Finance:       { bg: '#FFFBEB', text: '#92400E' },
  Personal:      { bg: '#EEF4ED', text: '#2A4E36' },
  Relationships: { bg: '#FFF0F6', text: '#9D174D' },
}

function EditGoalModal({ goal, goals, onClose }) {
  const [title,      setTitle]      = useState(goal.title)
  const [desc,       setDesc]       = useState(goal.description || '')
  const [type,       setType]       = useState(goal.type)
  const [category,   setCategory]   = useState(goal.category)
  const [targetDate, setTargetDate] = useState(goal.targetDate || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    goals.updateGoal(goal.id, { title: title.trim(), description: desc, type, category, targetDate })
    onClose()
  }

  const inputStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <Modal isOpen onClose={onClose} title="Edit Goal" fullScreenOnMobile>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Title *</label>
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
            className="input-base w-full" style={inputStyle} />
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)}
            rows={2} placeholder="Why does this matter to you?"
            className="input-base w-full resize-none" style={inputStyle} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>Type</label>
            <div className="flex flex-col gap-1.5">
              {GOAL_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className="py-1.5 rounded-xl text-xs font-medium transition-all border"
                  style={type === t
                    ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                    : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                  }>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide block mb-2" style={{ color: 'var(--text-muted)' }}>Category</label>
            <div className="flex flex-col gap-1.5">
              {GOAL_CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className="py-1.5 rounded-xl text-xs font-medium transition-all border"
                  style={category === c
                    ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                    : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                  }>{c}</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Target date</label>
          <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
            className="input-base w-full" style={inputStyle} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Cancel</button>
          <button type="submit" disabled={!title.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)' }}>Save changes</button>
        </div>
      </form>
    </Modal>
  )
}

const GoalCardImpl = memo(function GoalCard({ goal, goals }) {
  const { toast } = useToast()
  const [expanded,  setExpanded]  = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [newMs,     setNewMs]     = useState('')
  const progress = goals.getProgress(goal)
  const catStyle = CAT_COLORS[goal.category] ?? { bg: 'var(--bg-secondary)', text: 'var(--text-muted)' }

  const handleAddMilestone = (e) => {
    e.preventDefault()
    if (!newMs.trim()) return
    goals.addMilestone(goal.id, newMs.trim())
    setNewMs('')
  }

  const handleToggleMilestone = (msId) => {
    goals.toggleMilestone(goal.id, msId)
  }

  const handleToggleGoal = () => {
    goals.toggleGoal(goal.id)
  }

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden card-hover transition-all"
        style={{
          backgroundColor: 'var(--surface)',
          boxShadow:       goal.completed ? '0 0 0 2px var(--accent-mid), var(--shadow-card)' : 'var(--shadow-card)',
          opacity:         goal.completed ? 0.8 : 1,
        }}
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            {/* Progress ring */}
            <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90 flex-shrink-0">
              <circle cx="22" cy="22" r="16" fill="none" stroke="var(--border)" strokeWidth="4" />
              <circle cx="22" cy="22" r="16" fill="none"
                stroke={progress === 100 ? 'var(--accent)' : 'var(--accent-mid)'} strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(progress / 100) * 100.53} 100.53`} />
            </svg>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-serif text-base leading-snug"
                    style={{ color: goal.completed ? 'var(--text-faint)' : 'var(--text)',
                             textDecoration: goal.completed ? 'line-through' : 'none' }}>
                    {goal.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
                      {goal.type}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: catStyle.bg, color: catStyle.text }}>
                      {goal.category}
                    </span>
                    {goal.targetDate && (
                      <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                        📅 {goal.targetDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={handleToggleGoal}
                    className="text-xs px-2.5 py-1 rounded-full border transition-all"
                    style={goal.completed
                      ? { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
                      : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                    }>
                    {goal.completed ? '✓ Done' : 'Complete'}
                  </button>
                  <button onClick={() => setEditing(true)}
                    className="hover-surface w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
                    style={{ color: 'var(--text-faint)' }}
                    title="Edit goal">✏️</button>
                  <button onClick={() => { goals.deleteGoal(goal.id); toast.undo('Goal deleted', () => goals.restoreGoal(goal)) }}
                    className="hover-danger w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
                    style={{ color: 'var(--text-faint)' }}>✕</button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Progress</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text)' }}>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }} />
                </div>
              </div>
            </div>
          </div>

          {goal.description && (
            <p className="text-xs mt-3 leading-relaxed italic" style={{ color: 'var(--text-muted)' }}>
              {goal.description}
            </p>
          )}

          <button onClick={() => setExpanded(e => !e)}
            className="mt-3 text-xs font-medium transition-colors flex items-center gap-1"
            style={{ color: 'var(--accent)' }}>
            {expanded ? '▲' : '▼'} {goal.milestones.length} milestone{goal.milestones.length !== 1 ? 's' : ''}
          </button>
        </div>

        {/* Milestones panel */}
        {expanded && (
          <div className="border-t px-5 pb-4" style={{ borderColor: 'var(--border-soft)' }}>
            <ul className="space-y-2 mt-3 mb-3">
              {goal.milestones.length === 0 && (
                <li className="text-xs italic" style={{ color: 'var(--text-faint)' }}>No milestones yet</li>
              )}
              {goal.milestones.map(m => (
                <li key={m.id} className="flex items-center gap-2.5">
                  <button onClick={() => handleToggleMilestone(m.id)}
                    className="w-4 h-4 rounded border-2 flex items-center justify-center text-[9px] flex-shrink-0 transition-all"
                    style={m.done
                      ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                      : { borderColor: 'var(--border)' }
                    }>{m.done && '✓'}</button>
                  <span className="text-sm" style={{ color: m.done ? 'var(--text-faint)' : 'var(--text)',
                    textDecoration: m.done ? 'line-through' : 'none' }}>{m.text}</span>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddMilestone} className="flex gap-2">
              <input value={newMs} onChange={e => setNewMs(e.target.value)}
                placeholder="Add a milestone…"
                className="flex-1 text-xs rounded-lg px-3 py-2 outline-none border"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <button type="submit" disabled={!newMs.trim()}
                className="text-xs px-3 py-2 rounded-lg text-white disabled:opacity-40 transition-colors"
                style={{ backgroundColor: 'var(--accent)' }}>Add</button>
            </form>
          </div>
        )}
      </div>

      {editing && <EditGoalModal goal={goal} goals={goals} onClose={() => setEditing(false)} />}
    </>
  )
})
export default GoalCardImpl
