// Component: StepBuilderCard
// Purpose: One numbered step in the routine editor — title, duration, up/down
//          reorder controls, remove. Parent owns the steps array and passes
//          down index-based handlers.
export default function StepBuilderCard({ step, index, total, onChange, onMoveUp, onMoveDown, onRemove }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--accent-light)' }}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--accent)' }}>{index + 1}.</span>
        <input
          value={step.text}
          onChange={e => onChange({ ...step, text: e.target.value })}
          className="flex-1 bg-transparent text-sm font-medium outline-none"
          style={{ color: 'var(--text)' }}
          placeholder="Step name"
        />
        <input
          type="number"
          value={step.duration ?? ''}
          onChange={e => onChange({ ...step, duration: e.target.value ? Number(e.target.value) : null })}
          className="w-14 bg-transparent text-xs text-right outline-none"
          style={{ color: 'var(--text-faint)' }}
          placeholder="min"
        />
      </div>
      <div className="flex justify-end gap-2 mt-1">
        <button type="button" disabled={index === 0} onClick={onMoveUp} aria-label="Move step up" className="text-xs disabled:opacity-30" style={{ color: 'var(--text-faint)' }}>↑</button>
        <button type="button" disabled={index === total - 1} onClick={onMoveDown} aria-label="Move step down" className="text-xs disabled:opacity-30" style={{ color: 'var(--text-faint)' }}>↓</button>
        <button type="button" onClick={onRemove} aria-label="Remove step" className="text-xs" style={{ color: 'var(--text-faint)' }}>✕</button>
      </div>
    </div>
  )
}
