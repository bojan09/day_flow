// Component: GoalForecaster
// Purpose: Predicts goal completion based on milestone completion velocity.
//          Shows projected finish date, days ahead/behind, and AI coaching.
import { useState, useMemo } from 'react'
import { differenceInDays, addDays, format, parseISO } from 'date-fns'

function forecastGoal(goal, getProgress) {
  const progress     = getProgress(goal)
  const milestones   = goal.milestones || []
  const doneMilestones = milestones.filter(m => m.done).length
  const total        = milestones.length

  if (total < 2 || doneMilestones === 0) return null

  // Estimate velocity: milestones done per day since goal creation
  const created    = goal.createdAt ? new Date(goal.createdAt) : new Date()
  const daysElapsed = Math.max(differenceInDays(new Date(), created), 1)
  const velocity   = doneMilestones / daysElapsed   // milestones/day

  if (velocity <= 0) return null

  // Remaining milestones
  const remaining  = total - doneMilestones
  const daysNeeded = remaining / velocity

  const projected  = addDays(new Date(), daysNeeded)
  const targetDate = goal.targetDate ? parseISO(goal.targetDate) : null

  let status = null
  if (targetDate) {
    const diff = differenceInDays(targetDate, projected)
    status = diff >= 0
      ? { type: 'ahead',   label: `On track — ${diff}d ahead of target`,  color: '#10B981' }
      : { type: 'behind',  label: `${Math.abs(diff)}d behind target`,       color: '#EF4444' }
  }

  return {
    progress,
    projected,
    velocity:   (velocity * 7).toFixed(1),   // milestones/week
    daysNeeded: Math.round(daysNeeded),
    status,
    doneMilestones,
    total,
  }
}

export default function GoalForecaster({ goals }) {
  const [expanded, setExpanded] = useState(null)

  const activeGoals = goals.goals.filter(g => !g.completed && g.milestones?.length >= 2)

  const forecasts = useMemo(() =>
    activeGoals.map(g => ({
      goal: g,
      forecast: forecastGoal(g, goals.getProgress),
    })).filter(f => f.forecast !== null),
  [activeGoals, goals.getProgress])

  if (forecasts.length === 0) {
    return (
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
          🔮 Goal Forecasting
        </p>
        <p className="text-sm italic" style={{ color: 'var(--text-faint)' }}>
          Add at least 2 milestones to a goal and start completing them to see forecasts.
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: 'var(--border-soft)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
          🔮 Goal Forecasting
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Projected completion dates based on your milestone velocity
        </p>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border-soft)' }}>
        {forecasts.map(({ goal, forecast }) => {
          const isOpen = expanded === goal.id
          return (
            <div key={goal.id}>
              <button
                onClick={() => setExpanded(isOpen ? null : goal.id)}
                className="hover-surface w-full px-5 py-4 text-left transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Progress ring */}
                  <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90 flex-shrink-0">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none"
                      stroke={forecast.status?.color || 'var(--accent)'} strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(forecast.progress / 100) * 87.96} 87.96`}
                    />
                  </svg>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                        {goal.title}
                      </p>
                      <span className="text-[10px] font-bold flex-shrink-0"
                        style={{ color: forecast.status?.color || 'var(--accent)' }}>
                        {forecast.progress}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                        📅 Projected: {format(forecast.projected, 'MMM d, yyyy')}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                        {forecast.velocity}/wk
                      </span>
                    </div>

                    {forecast.status && (
                      <p className="text-[11px] font-semibold mt-1"
                        style={{ color: forecast.status.color }}>
                        {forecast.status.label}
                      </p>
                    )}
                  </div>

                  <span
                    className="text-xs flex-shrink-0 transition-transform duration-200"
                    style={{ color: 'var(--text-faint)', transform: isOpen ? 'rotate(180deg)' : 'none' }}
                  >▼</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
                  <div className="grid grid-cols-3 gap-3 mt-4 mb-3">
                    {[
                      { label: 'Milestones',  value: `${forecast.doneMilestones}/${forecast.total}` },
                      { label: 'Velocity',    value: `${forecast.velocity}/wk` },
                      { label: 'Days left',   value: `~${forecast.daysNeeded}d` },
                    ].map(s => (
                      <div key={s.label}
                        className="text-center p-3 rounded-xl border"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                        <p className="font-serif text-lg" style={{ color: 'var(--text)' }}>{s.value}</p>
                        <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Milestone list */}
                  <div className="space-y-1.5">
                    {goal.milestones.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-[9px]"
                          style={m.done
                            ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                            : { borderColor: 'var(--border)' }
                          }
                        >{m.done && '✓'}</span>
                        <span className="text-xs" style={{
                          color:          m.done ? 'var(--text-faint)' : 'var(--text)',
                          textDecoration: m.done ? 'line-through' : 'none',
                        }}>{m.text}</span>
                      </div>
                    ))}
                  </div>

                  {forecast.status?.type === 'behind' && (
                    <div
                      className="mt-3 p-3 rounded-xl border text-xs"
                      style={{ backgroundColor: '#FEF3C7', borderColor: '#FDE68A', color: '#92400E' }}
                    >
                      💡 To hit your target: complete {Math.ceil(forecast.total / Math.max(differenceInDays(parseISO(goal.targetDate), new Date()), 1) * 7)} milestones/week
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
