// Component: FocusTask
// Purpose: Pinned focus task for the day — theme-aware with premium active state
export default function FocusTask({ tasks }) {
  const focus      = tasks.getFocusTask()
  const todayTasks = tasks.getTodayTasks().filter(t => !t.completed)

  if (!focus && todayTasks.length === 0) return null

  return (
    <div
      className="rounded-2xl border-2 p-5 transition-all duration-300"
      style={focus
        ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', boxShadow: '0 8px 24px rgba(59,107,75,0.3)' }
        : { backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderStyle: 'dashed' }
      }
    >
      <p className="text-xs font-medium uppercase tracking-widest mb-2"
        style={{ color: focus ? 'rgba(255,255,255,0.7)' : 'var(--text-faint)' }}>
        🎯 Focus Task
      </p>

      {focus ? (
        <div className="flex items-center gap-3">
          <button onClick={() => tasks.toggleTask(focus.id)}
            className="w-6 h-6 rounded-md border-2 border-white/50 hover:border-white flex items-center justify-center text-xs flex-shrink-0 transition-all text-white">
            {focus.completed ? '✓' : ''}
          </button>
          <span className={`flex-1 font-serif text-lg text-white leading-snug ${focus.completed ? 'line-through opacity-50' : ''}`}>
            {focus.title}
          </span>
          <button aria-label="Remove focus task" onClick={() => tasks.setFocus(focus.id)}
            className="text-white/50 hover:text-white text-xs transition-colors">✕</button>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-hide">
          {todayTasks.slice(0, 4).map(t => (
            <button key={t.id} onClick={() => tasks.setFocus(t.id)}
              className="w-full text-left flex items-center gap-2 text-sm py-1 group"
              style={{ color: 'var(--text-muted)' }}>
              <span className="text-base transition-colors group-hover:[color:var(--accent)]">◎</span>
              <span className="truncate transition-colors">{t.title}</span>
              <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-all [color:var(--accent)]">
                Set focus
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
