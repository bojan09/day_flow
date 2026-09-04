// Component: PriorityRecommendation
// Purpose: Surfaces the single most important task to work on right now.
//          Based on focus pin, priority, overdue status, and time of day.
export default function PriorityRecommendation({ analysis, onTabChange }) {
  const { topRecommendation, overdue, activeTasks } = analysis
  if (!topRecommendation) return null

  const { task, reason } = topRecommendation
  const PRIORITY_COLORS = {
    high:   { bg: 'var(--tone-red-bg)', border: 'var(--tone-red-border)', text: 'var(--tone-red-text)', dot: '#EF4444' },
    medium: { bg: 'var(--tone-amber-bg)', border: 'var(--tone-amber-border)', text: 'var(--tone-amber-text)', dot: '#F59E0B' },
    low:    { bg: 'var(--tone-emerald-bg)', border: 'var(--tone-emerald-border)', text: 'var(--tone-emerald-text)', dot: '#22C55E' },
  }
  const colors = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
          🎯 Work on this next
        </p>
        {overdue.length > 0 && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: 'var(--tone-red-bg)', color: 'var(--tone-red-text)' }}
          >
            {overdue.length} overdue
          </span>
        )}
      </div>

      <div
        className="flex items-start gap-3 p-3 rounded-xl border"
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        {/* Priority dot */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
          style={{ backgroundColor: colors.dot }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text)' }}>
            {task.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: colors.text }}>
            {reason}
            {task.estimateMins && ` · ~${task.estimateMins}min`}
          </p>
        </div>
        <button
          onClick={() => onTabChange?.('tasks')}
          className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all active:scale-95"
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          Go →
        </button>
      </div>

      {activeTasks > 1 && (
        <p className="text-[10px] mt-2 text-right" style={{ color: 'var(--text-faint)' }}>
          {activeTasks - 1} more task{activeTasks - 1 !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  )
}
