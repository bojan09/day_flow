// Component: FocusTask
// Purpose: Highlights the single pinned "focus task" for the day
export default function FocusTask({ tasks }) {
  const focus      = tasks.getFocusTask()
  const todayTasks = tasks.getTodayTasks().filter(t => !t.completed)

  if (!focus && todayTasks.length === 0) return null

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all ${
      focus
        ? 'bg-forest-500 border-forest-500 text-white'
        : 'bg-white border-dashed border-stone-200'
    }`}>
      <p className={`text-xs font-medium uppercase tracking-widest mb-2 ${focus ? 'text-white/70' : 'text-ink-faint'}`}>
        🎯 Focus Task
      </p>
      {focus ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => tasks.toggleTask(focus.id)}
            className="w-6 h-6 rounded-md border-2 border-white/50 hover:border-white flex items-center justify-center text-xs flex-shrink-0 transition-all"
          >
            {focus.completed ? '✓' : ''}
          </button>
          <span className={`flex-1 font-serif text-lg leading-snug ${focus.completed ? 'line-through opacity-50' : ''}`}>
            {focus.title}
          </span>
          <button
            onClick={() => tasks.setFocus(focus.id)}
            className="text-white/50 hover:text-white text-xs transition-colors"
            title="Unpin"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-hide">
          {todayTasks.slice(0, 4).map(t => (
            <button
              key={t.id}
              onClick={() => tasks.setFocus(t.id)}
              className="w-full text-left flex items-center gap-2 text-sm text-ink-muted hover:text-ink py-1 group"
            >
              <span className="text-stone-300 group-hover:text-forest-400 text-base transition-colors">◎</span>
              <span className="truncate">{t.title}</span>
              <span className="ml-auto text-[10px] text-stone-300 group-hover:text-forest-400 opacity-0 group-hover:opacity-100 transition-all">
                Set as focus
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
