// Component: GoalsView
// Purpose: Goals tab — XP level bar, type filter, goal cards with milestones
import { useState } from 'react'
import GoalCard       from './GoalCard'
import GoalForecaster from './GoalForecaster'
import AddGoalModal from './AddGoalModal'
import EmptyState   from '../ui/EmptyState'
import { GOAL_TYPES } from '../../hooks/useGoals'

function XPBar({ xp }) {
  const info = xp.getLevelInfo()
  return (
    <div className="[background-color:var(--surface)] rounded-2xl border [border-color:var(--border-soft)] shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-serif text-base [color:var(--text)]">{info.title}</span>
        <span className="text-xs font-medium [color:var(--accent)] [background-color:var(--accent-light)] px-2.5 py-0.5 rounded-full">
          {info.totalXP} XP
        </span>
      </div>
      <div className="h-2 [background-color:var(--bg-secondary)] rounded-full overflow-hidden">
        <div
          className="h-full [background-color:var(--accent)] rounded-full transition-all duration-700"
          style={{ width: `${info.progress}%` }}
        />
      </div>
      {info.next && (
        <p className="text-[10px] [color:var(--text-faint)] mt-1.5">
          {info.next.min - info.totalXP} XP to level {info.next.level} · {info.next.title}
        </p>
      )}
    </div>
  )
}

export default function GoalsView({ goals, xp }) {
  if (!goals?.goals) return null
  const [modal, setModal]           = useState(false)
  const [activeType, setActiveType] = useState('All')

  const visible = activeType === 'All'
    ? goals.goals
    : goals.goals.filter(g => g.type === activeType)

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      <XPBar xp={xp} />

      <div className="flex items-center justify-between">
        <p className="text-sm [color:var(--text-muted)]">{goals.goals.length} goals</p>
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 rounded-full [background-color:var(--accent)] text-white text-sm font-medium hover:[background-color:var(--accent)] transition-colors"
        >
          + New Goal
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['All', ...GOAL_TYPES].map(t => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all border ${
              activeType === t
                ? 'bg-ink text-white border-ink'
                : '[background-color:var(--surface)] [border-color:var(--border)] [color:var(--text-muted)] hover:[border-color:var(--border)]'
            }`}
          >{t}</button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState type="default" title="No goals yet"
          subtitle="Set a big goal and break it into milestones."
          action="+ New Goal" onAction={() => setModal(true)}
        />
      ) : (
        <div className="space-y-4">
          {visible.map(g => <GoalCard key={g.id} goal={g} goals={goals} xp={xp} />)}
        </div>
      )}

      <AddGoalModal
        isOpen={modal}
        onClose={() => setModal(false)}
        onAdd={g => { goals.addGoal(g); setModal(false) }}
      />
    </div>
  )
}
