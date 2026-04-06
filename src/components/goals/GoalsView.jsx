// Component: GoalsView
// Purpose: Goals tab — XP level bar, type filter, goal cards with milestones
import { useState } from 'react'
import GoalCard     from './GoalCard'
import AddGoalModal from './AddGoalModal'
import EmptyState   from '../ui/EmptyState'
import { GOAL_TYPES } from '../../hooks/useGoals'

function XPBar({ xp }) {
  const info = xp.getLevelInfo()
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-serif text-base text-ink">{info.title}</span>
        <span className="text-xs font-medium text-forest-500 bg-forest-50 px-2.5 py-0.5 rounded-full">
          {info.totalXP} XP
        </span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-forest-500 rounded-full transition-all duration-700"
          style={{ width: `${info.progress}%` }}
        />
      </div>
      {info.next && (
        <p className="text-[10px] text-ink-faint mt-1.5">
          {info.next.min - info.totalXP} XP to level {info.next.level} · {info.next.title}
        </p>
      )}
    </div>
  )
}

export default function GoalsView({ goals, xp }) {
  const [modal, setModal]           = useState(false)
  const [activeType, setActiveType] = useState('All')

  const visible = activeType === 'All'
    ? goals.goals
    : goals.goals.filter(g => g.type === activeType)

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      <XPBar xp={xp} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{goals.goals.length} goals</p>
        <button
          onClick={() => setModal(true)}
          className="px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors"
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
                : 'bg-white border-stone-200 text-ink-muted hover:border-stone-300'
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
