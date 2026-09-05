// Component: TaskSection
// Purpose: One time-bucket section (Overdue/Today/Upcoming/Someday) — header
//          + its task rows. Row rendering matches the existing TasksView row
//          markup (color dot, checkbox, category badge, priority badge, actions).
import { memo } from 'react'
import Badge from '../ui/Badge'

const CAT_COLORS = {
  Work:     'bg-blue-100 text-blue-700',
  Personal: '[background-color:var(--accent-light)] [color:var(--accent-text)]',
  Health:   'bg-emerald-100 text-emerald-700',
  Learning: 'bg-violet-100 text-violet-700',
  Finance:  'bg-amber-100 text-amber-700',
  Other:    '[background-color:var(--bg-secondary)] text-stone-600',
}
const CAT_DOT = {
  Work:     'bg-blue-400',
  Personal: '[background-color:var(--accent)]',
  Health:   'bg-emerald-500',
  Learning: 'bg-violet-500',
  Finance:  'bg-amber-400',
  Other:    '[background-color:var(--border)]',
}
const URGENCY_STRIPE = {
  overdue: '#B5654A',
  today:   'var(--accent)',
  future:  'var(--border)',
}

const TaskRow = memo(function TaskRow({ t, idx, urgency, tasksApi, projects, onTabChange, onOpenDetail, onOpenRecur, onDelete }) {
  return (
    <li key={t.id}
      role="button"
      tabIndex={0}
      aria-label={`Open task: ${t.title}`}
      className="flex items-start gap-3 px-5 py-3.5 hover:[background-color:var(--bg-secondary)]/50 transition-colors group cursor-pointer animate-fade-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:[outline-color:var(--accent)]"
      style={{ animationDelay: `${Math.min(idx * 35, 350)}ms`, animationFillMode: 'both', borderLeft: `3px solid ${URGENCY_STRIPE[urgency]}` }}
      onClick={() => onOpenDetail(t)}
      onKeyDown={e => {
        // Only handle key presses that land directly on the row itself —
        // nested <button>s (checkbox, focus, schedule, delete, recur) already
        // handle their own Enter/Space activation and stopPropagation on click,
        // so we must not double-fire onOpenDetail when a descendant is focused.
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenDetail(t)
        }
      }}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${CAT_DOT[t.category] ?? '[background-color:var(--border)]'}`} />
      <button
        onClick={e => { e.stopPropagation(); tasksApi.toggleTask(t.id) }}
        className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center text-xs transition-all ${
          t.completed ? '[background-color:var(--accent)] [border-color:var(--accent)] text-white' : '[border-color:var(--border)] hover:[border-color:var(--accent-mid)]'
        }`}>
        {t.completed && '✓'}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-[15px] leading-snug font-medium line-clamp-3 ${t.completed ? 'line-through [color:var(--text-faint)]' : '[color:var(--text)]'}`}>
          {t.title}
        </p>
        {t.notes && (
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-faint)' }}>{t.notes}</p>
        )}
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${CAT_COLORS[t.category] ?? '[background-color:var(--bg-secondary)] text-stone-600'}`}>
            {t.category}
          </span>
          {t.estimateMins && <span className="text-[11px] [color:var(--text-faint)]">⏱ {t.estimateMins < 60 ? `${t.estimateMins}m` : `${t.estimateMins/60}h`}</span>}
          {t.isRecurring && (
            <button type="button" aria-label="Manage recurrence"
              onClick={e => { e.stopPropagation(); onOpenRecur(t) }}
              className="text-[11px] [color:var(--accent-text)] hover:opacity-70 transition-opacity">
              🔁{(t.recurStatus ?? 'active') !== 'active' && <span className="ml-0.5 [color:var(--text-muted)]">paused</span>}
            </button>
          )}
          {(t.subTasks?.length) > 0 && <span className="text-[11px] [color:var(--text-faint)]">· {t.subTasks.filter(s=>s.done).length}/{t.subTasks.length} sub</span>}
          {t.projectId && projects?.find(p => p.id === t.projectId) && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-faint)' }}>
              🗂️ {projects.find(p => p.id === t.projectId)?.name}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5" onClick={e => e.stopPropagation()}>
        {t.priority === 'high' && (
          <Badge label="High" color="high" />
        )}
        <button onClick={() => tasksApi.setFocus(t.id)}
          aria-label={t.isFocus ? 'Remove focus' : 'Mark as focus'}
          className={`hidden md:block text-sm p-1 rounded md:opacity-0 md:group-hover:opacity-100 transition-all ${t.isFocus ? 'md:opacity-100 [color:var(--accent-text)]' : '[color:var(--text-faint)] hover:[color:var(--accent-text)]'}`}>
          {t.isFocus ? '📌' : '📍'}
        </button>
        {onTabChange && (
          <button onClick={() => onTabChange('timeblock')}
            className="hidden md:block md:opacity-0 md:group-hover:opacity-100 text-[11px] px-1.5 py-0.5 rounded transition-all"
            style={{ color: 'var(--accent-text)', backgroundColor: 'var(--accent-light)' }} title="Open in Schedule" aria-label="Open in Schedule">⏰</button>
        )}
        <button aria-label="Delete task" onClick={() => onDelete(t)}
          className="tap-target flex items-center justify-center min-w-[40px] min-h-[40px] -mr-1.5 rounded-lg [color:var(--text-faint)] hover:text-red-400 md:opacity-0 md:group-hover:opacity-100 transition-all text-base">✕</button>
      </div>
    </li>
  )
})

export default function TaskSection({ title, tasks, urgency, tasksApi, projects, onTabChange, onOpenDetail, onOpenRecur, onDelete }) {
  if (tasks.length === 0) return null
  return (
    <div className="space-y-2">
      <h3 className="font-serif text-base font-semibold px-1" style={{ color: 'var(--text)' }}>{title}</h3>
      <ul className="rounded-2xl overflow-hidden divide-y" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-card)' }}>
        {tasks.map((t, idx) => (
          <TaskRow
            key={t.id}
            t={t}
            idx={idx}
            urgency={urgency}
            tasksApi={tasksApi}
            projects={projects}
            onTabChange={onTabChange}
            onOpenDetail={onOpenDetail}
            onOpenRecur={onOpenRecur}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  )
}
