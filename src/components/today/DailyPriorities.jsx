import { getTodayKey } from '../../utils/dateUtils'

export default function DailyPriorities({ priorities, allTasks, onToggleTask, onStartFocus }) {
  const selected = new Set(priorities.ids)
  const today = getTodayKey()
  const candidates = allTasks.filter(task => !task.completed && task.date <= today && !selected.has(String(task.id)))
  const move = (index, offset) => {
    const next = [...priorities.ids]
    const target = index + offset
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    priorities.reorder(next)
  }

  return (
    <section className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }} aria-labelledby="daily-priorities-title">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 id="daily-priorities-title" className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Daily Big 3</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Choose up to three tasks that matter today.</p>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{priorities.ids.length}/3</span>
      </div>

      <div className="space-y-2">
        {priorities.tasks.map((task, index) => (
          <div key={task.id} className="flex items-center gap-2 rounded-xl border p-2.5" style={{ borderColor: 'var(--border)' }}>
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>{index + 1}</span>
            <button className="flex-1 text-left text-sm font-medium" onClick={() => onToggleTask(task.id)}>{task.title}</button>
            <button className="text-xs" disabled={index === 0} aria-label={`Move ${task.title} up`} onClick={() => move(index, -1)}>↑</button>
            <button className="text-xs" disabled={index === priorities.tasks.length - 1} aria-label={`Move ${task.title} down`} onClick={() => move(index, 1)}>↓</button>
            <button className="text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--accent)' }} onClick={() => onStartFocus?.(task.id)}>Focus</button>
            <button className="text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--text-faint)' }} aria-label={`Remove ${task.title} from Daily Big 3`} onClick={() => priorities.remove(task.id)}>Remove</button>
          </div>
        ))}
        {priorities.tasks.length === 0 && <p className="text-sm py-2" style={{ color: 'var(--text-muted)' }}>No priorities chosen yet.</p>}
      </div>

      {priorities.ids.length < 3 && candidates.length > 0 && (
        <label className="block mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          Add a task
          <select className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }} value="" onChange={event => { if (event.target.value) priorities.add(event.target.value) }}>
            <option value="">Choose an incomplete task…</option>
            {candidates.map(task => <option key={task.id} value={task.id}>{task.title}</option>)}
          </select>
        </label>
      )}
    </section>
  )
}
