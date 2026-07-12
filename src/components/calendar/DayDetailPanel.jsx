// Component: DayDetailPanel
// Purpose: Side panel showing the selected day's tasks. `dayTasks` is the
//          array already filtered to the selected date by the caller
//          (CalendarView, via tasks.getTasksByDate).
export default function DayDetailPanel({ date, dayTasks, onToggleTask, onOpenTask }) {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
      <h3 className="font-serif text-lg font-semibold" style={{ color: 'var(--text)' }}>{date}</h3>
      {dayTasks.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Nothing scheduled.</p>
      ) : (
        <ul className="space-y-1.5">
          {dayTasks.map(t => (
            <li key={t.id} className="flex items-center gap-2 cursor-pointer" onClick={() => onOpenTask(t)}>
              <button
                onClick={e => { e.stopPropagation(); onToggleTask(t.id) }}
                className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px]"
                style={{
                  backgroundColor: t.completed ? 'var(--accent)' : 'transparent',
                  borderColor: t.completed ? 'var(--accent)' : 'var(--border)',
                  color: '#fff',
                }}>
                {t.completed && '✓'}
              </button>
              <span className="text-sm truncate" style={{ color: t.completed ? 'var(--text-faint)' : 'var(--text)', textDecoration: t.completed ? 'line-through' : 'none' }}>
                {t.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
