// Component: a transparent, actionable next-task recommendation.
export default function PriorityRecommendation({ analysis, onTabChange, onStartFocus }) {
  const { topRecommendation, overdue, activeTasks } = analysis
  if (!topRecommendation) return (
    <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Work on this next</p>
      <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>You’re clear. Capture something new or enjoy the space.</p>
    </div>
  )

  const { task, reasons } = topRecommendation
  const colors = {
    high: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', dot: '#EF4444' },
    medium: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', dot: '#F59E0B' },
    low: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', dot: '#22C55E' },
  }[task.priority] ?? { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', dot: '#F59E0B' }

  return (
    <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>🎯 Work on this next</p>
        {overdue.length > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}>{overdue.length} overdue</span>}
      </div>
      <div className="flex items-start gap-3 p-3 rounded-xl border" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: colors.dot }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text)' }}>{task.title}</p>
          <p className="text-xs mt-0.5" style={{ color: colors.text }}>{reasons.slice(0, 2).map(reason => reason.label).join(' · ')}</p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {task.priority || 'medium'} priority{task.estimateMins ? ` · ~${task.estimateMins} min` : ''}{task.date ? ` · ${task.date}` : ' · unscheduled'}{task.dueTime ? ` at ${task.dueTime}` : ''}
          </p>
        </div>
        <button onClick={() => onStartFocus ? onStartFocus(task.id) : onTabChange?.('focus')} className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all active:scale-95" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
          Start Focus
        </button>
      </div>
      {activeTasks > 1 && <p className="text-[10px] mt-2 text-right" style={{ color: 'var(--text-faint)' }}>{activeTasks - 1} more task{activeTasks - 1 !== 1 ? 's' : ''} remaining</p>}
    </div>
  )
}
