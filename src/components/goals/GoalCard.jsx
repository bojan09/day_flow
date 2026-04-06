// Component: GoalCard
// Purpose: Single goal card — progress ring, milestones checklist, add milestone input
import { useState } from 'react'
import { GOAL_CATEGORIES } from '../../hooks/useGoals'
import { XP_EVENTS } from '../../hooks/useXP'

const CAT_COLORS = {
  Career: 'bg-blue-50 text-blue-700', Health: 'bg-emerald-50 text-emerald-700',
  Learning: 'bg-violet-50 text-violet-700', Finance: 'bg-amber-50 text-amber-700',
  Personal: 'bg-forest-50 text-forest-700', Relationships: 'bg-pink-50 text-pink-700',
}

export default function GoalCard({ goal, goals, xp }) {
  const [expanded, setExpanded] = useState(false)
  const [newMs,    setNewMs]    = useState('')
  const progress = goals.getProgress(goal)

  const handleAddMilestone = (e) => {
    e.preventDefault()
    if (!newMs.trim()) return
    goals.addMilestone(goal.id, newMs.trim())
    setNewMs('')
  }

  const handleToggleMilestone = (msId) => {
    goals.toggleMilestone(goal.id, msId)
    xp.awardXP('GOAL_MILESTONE', goal.title)
  }

  const handleToggleGoal = () => {
    goals.toggleGoal(goal.id)
    if (!goal.completed) xp.awardXP('GOAL_COMPLETE', goal.title)
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
      goal.completed ? 'border-forest-200 opacity-75' : 'border-stone-100'
    }`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Mini progress ring */}
          <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90 flex-shrink-0">
            <circle cx="22" cy="22" r="16" fill="none" stroke="#F1EDE8" strokeWidth="4" />
            <circle cx="22" cy="22" r="16" fill="none"
              stroke={progress === 100 ? '#3B6B4B' : '#A7C9A0'} strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(progress / 100) * 100.53} 100.53`} />
          </svg>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`font-serif text-base text-ink leading-snug ${goal.completed ? 'line-through text-ink-faint' : ''}`}>
                  {goal.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] font-medium text-ink-faint uppercase tracking-wide">{goal.type}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[goal.category] ?? 'bg-stone-100 text-stone-600'}`}>
                    {goal.category}
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={handleToggleGoal}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    goal.completed ? 'bg-forest-500 text-white border-forest-500' : 'border-stone-200 text-ink-muted hover:bg-stone-50'
                  }`}>
                  {goal.completed ? '✓ Done' : 'Complete'}
                </button>
                <button onClick={() => goals.deleteGoal(goal.id)}
                  className="text-xs text-ink-faint hover:text-red-400 p-1 transition-colors">✕</button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-ink-faint uppercase tracking-wide">Progress</span>
                <span className="text-[10px] font-medium text-ink">{progress}%</span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full">
                <div className="h-full bg-forest-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-xs text-ink-muted mt-3 leading-relaxed italic">{goal.description}</p>
        )}

        {/* Toggle milestones */}
        <button onClick={() => setExpanded(e => !e)}
          className="mt-3 text-xs text-forest-500 hover:text-forest-700 transition-colors font-medium flex items-center gap-1">
          {expanded ? '▲' : '▼'} {goal.milestones.length} milestone{goal.milestones.length !== 1 ? 's' : ''}
        </button>
      </div>

      {/* Milestones panel */}
      {expanded && (
        <div className="border-t border-stone-50 px-5 pb-4">
          <ul className="space-y-2 mt-3 mb-3">
            {goal.milestones.length === 0 && (
              <li className="text-xs text-ink-faint italic">No milestones yet — add one below</li>
            )}
            {goal.milestones.map(m => (
              <li key={m.id} className="flex items-center gap-2.5">
                <button onClick={() => handleToggleMilestone(m.id)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[9px] flex-shrink-0 transition-all ${
                    m.done ? 'bg-forest-500 border-forest-500 text-white' : 'border-stone-300 hover:border-forest-400'
                  }`}>
                  {m.done && '✓'}
                </button>
                <span className={`text-sm ${m.done ? 'line-through text-ink-faint' : 'text-ink'}`}>{m.text}</span>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddMilestone} className="flex gap-2">
            <input value={newMs} onChange={e => setNewMs(e.target.value)}
              placeholder="Add a milestone..."
              className="flex-1 text-xs bg-parchment border border-stone-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-forest-300" />
            <button type="submit" disabled={!newMs.trim()}
              className="text-xs px-3 py-2 rounded-lg bg-forest-500 text-white hover:bg-forest-700 disabled:opacity-40 transition-colors">
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
