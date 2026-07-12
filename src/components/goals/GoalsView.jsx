import ViewSkeleton from '../ui/ViewSkeleton'
// Component: GoalsView
// Purpose: Goals tab — type filter, goal cards with milestones
import { useState } from 'react'
import GoalCard       from './GoalCard'
import GoalForecaster from './GoalForecaster'
import AddGoalModal from './AddGoalModal'
import EmptyState   from '../ui/EmptyState'
import { GOAL_TYPES } from '../../hooks/useGoals'

export default function GoalsView({ goals }) {
  const [modal, setModal]           = useState(false)
  const [activeType, setActiveType] = useState('All')

  const visible = activeType === 'All'
    ? goals.goals
    : goals.goals.filter(g => g.type === activeType)


  if (!goals.synced) return <ViewSkeleton type="goals" />
  if (!goals?.goals) return null
  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
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
          {visible.map(g => <GoalCard key={g.id} goal={g} goals={goals} />)}
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
