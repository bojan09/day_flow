// Component: TasksView
// Purpose: Tasks tab — NLP input, color categories, sub-task detail modal, duplicate, templates, someday
import { useState } from 'react'
import Card          from '../ui/Card'
import Badge         from '../ui/Badge'
import Modal         from '../ui/Modal'
import TaskForm      from './TaskForm'
import QuickTaskBar          from './QuickTaskBar'
import SmartSchedulerPanel  from './SmartSchedulerPanel'
import NLPTaskInput  from './NLPTaskInput'
import TaskDetail    from './TaskDetail'
import EmptyState    from '../ui/EmptyState'
import TaskTemplates from '../templates/TaskTemplates'
import SomedayList   from '../summary/SomedayList'
import { getTodayKey } from '../../utils/dateUtils'
import { addDays, format } from 'date-fns'

const FILTERS = ['All', 'Today', 'Overdue', 'Pending', 'Done']

const CAT_COLORS = {
  Work:     'bg-blue-100 text-blue-700',
  Personal: '[background-color:var(--accent-light)] [color:var(--accent)]',
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

export default function TasksView({ tasks, templates, someday, projects, categories, onAddCategory, onRemoveCategory, onTabChange, energy, habits, ideas }) {
  const [filter,     setFilter]  = useState('Today')
  const [modalOpen,  setModal]   = useState(false)
  const [detailTask,   setDetail]      = useState(null)
  const [visibleCount, setVisibleCount] = useState(30)
  const todayKey = getTodayKey()

  const filtered = tasks.tasks.filter(t => {
    if (filter === 'Today')   return t.date === todayKey
    if (filter === 'Overdue') return tasks.isOverdue(t)
    if (filter === 'Pending') return !t.completed
    if (filter === 'Done')    return t.completed
    return true
  })
  const sorted = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    const p = { high: 0, medium: 1, low: 2 }
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1)
  })

  const overdueCount = tasks.tasks.filter(t => tasks.isOverdue(t)).length

  const handleDuplicateDay = () => {
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
    tasks.getTodayTasks().filter(t => !t.completed && !t.isRecurring)
      .forEach(t => tasks.addTask({ ...t, date: tomorrow }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">

      {/* Zero-friction quick entry */}
      <QuickTaskBar tasks={tasks} />

      {/* AI smart scheduler */}
      <SmartSchedulerPanel tasks={tasks} energy={energy} habits={habits} onTabChange={onTabChange} />

      <NLPTaskInput onAdd={t => tasks.addTask(t)} />

      <div className="flex items-center justify-between">
        <p className="text-sm [color:var(--text-muted)]">
          {tasks.tasks.length} tasks
          {overdueCount > 0 && <span className="ml-2 text-red-500 font-medium">· {overdueCount} overdue</span>}
        </p>
        <div className="flex gap-2">
          <button onClick={handleDuplicateDay}
            className="px-3 py-2 rounded-full border [border-color:var(--border)] [color:var(--text-muted)] text-xs font-medium hover:[background-color:var(--bg-secondary)] transition-colors">
            Copy to tomorrow →
          </button>
          <button onClick={() => setModal(true)}
            className="px-4 py-2 rounded-full [background-color:var(--accent)] text-white text-sm font-medium hover:[background-color:var(--accent)] transition-colors">
            + New
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all border ${
              filter === f ? 'bg-ink text-white border-ink' : '[background-color:var(--surface)] [border-color:var(--border)] [color:var(--text-muted)] hover:[border-color:var(--border)]'
            }`}>{f}</button>
        ))}
      </div>

      <Card noPad>
        {sorted.length === 0 ? (
          <EmptyState type="tasks" title="Nothing here" subtitle="Add a task using the input above." action="+ New Task" onAction={() => setModal(true)} />
        ) : (
          <ul className="divide-y [border-color:var(--border-soft)]">
            {/* Show all when small list, paginate when large */}
            {(sorted.length > 50 ? sorted.slice(0, visibleCount) : sorted).map((t, idx) => (
              <li key={t.id}
                className="flex items-center gap-3 px-5 py-3.5 hover:[background-color:var(--bg-secondary)]/50 transition-colors group cursor-pointer animate-fade-up"
                style={{ animationDelay: `${Math.min(idx * 35, 350)}ms`, animationFillMode: 'both' }}
                onClick={() => setDetail(t)}>
                {/* Color dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CAT_DOT[t.category] ?? '[background-color:var(--border)]'}`} />

                <button
                  onClick={e => { e.stopPropagation(); tasks.toggleTask(t.id) }}
                  className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all ${
                    t.completed ? '[background-color:var(--accent)] [border-color:var(--accent)] text-white' : '[border-color:var(--border)] hover:[border-color:var(--accent-mid)]'
                  }`}>
                  {t.completed && '✓'}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${t.completed ? 'line-through [color:var(--text-faint)]' : '[color:var(--text)]'}`}>{t.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${CAT_COLORS[t.category] ?? '[background-color:var(--bg-secondary)] text-stone-600'}`}>
                      {t.category}
                    </span>
                    {tasks.isOverdue(t)   && <span className="text-[11px] font-medium text-red-500 bg-red-50 px-1.5 rounded">Overdue</span>}
                    {tasks.isDueToday(t)  && <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-1.5 rounded">Due today</span>}
                    {t.estimateMins       && <span className="text-[11px] [color:var(--text-faint)]">⏱ {t.estimateMins < 60 ? `${t.estimateMins}m` : `${t.estimateMins/60}h`}</span>}
                    {t.isRecurring        && <span className="text-[11px] [color:var(--accent)]">🔁</span>}
                    {(t.subTasks?.length) > 0 && <span className="text-[11px] [color:var(--text-faint)]">· {t.subTasks.filter(s=>s.done).length}/{t.subTasks.length} sub</span>}
                    {t.projectId && projects?.find(p => p.id === t.projectId) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-faint)' }}>
                        🗂️ {projects.find(p => p.id === t.projectId)?.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <Badge label={t.priority} color={t.priority} />
                  <button onClick={() => tasks.setFocus(t.id)}
                    className={`text-sm p-1 rounded opacity-0 group-hover:opacity-100 transition-all ${t.isFocus ? 'opacity-100 [color:var(--accent)]' : '[color:var(--text-faint)] hover:[color:var(--accent)]'}`}>
                    {t.isFocus ? '📌' : '📍'}
                  </button>
                  {onTabChange && (
                    <button
                      onClick={() => onTabChange('timeblock')}
                      className="opacity-0 group-hover:opacity-100 text-[11px] px-1.5 py-0.5 rounded transition-all"
                      style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}
                      title="Open in Schedule"
                    >⏰</button>
                  )}
                  <button onClick={() => tasks.deleteTask(t.id)}
                    className="opacity-0 group-hover:opacity-100 [color:var(--text-faint)] hover:text-red-400 text-xs p-1 transition-all">✕</button>
                </div>
              </li>
            ))}
            {sorted.length > 50 && visibleCount < sorted.length && (
              <li className="text-center py-3">
                <button
                  onClick={() => setVisibleCount(v => v + 30)}
                  className="text-sm font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  Show {Math.min(30, sorted.length - visibleCount)} more ({sorted.length - visibleCount} remaining)
                </button>
              </li>
            )}
          </ul>
        )}
      </Card>

      {templates && someday && (
        <>
          <TaskTemplates templates={templates} tasks={tasks} />
          <SomedayList   someday={someday}    tasks={tasks} />
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModal(false)} title="New Task">
        <TaskForm onSubmit={t => { tasks.addTask(t); setModal(false) }} onCancel={() => setModal(false)} projects={projects || []} categories={categories} onAddCategory={onAddCategory} onRemoveCategory={onRemoveCategory} />
      </Modal>

      <TaskDetail task={detailTask} tasks={tasks} isOpen={!!detailTask} onClose={() => setDetail(null)} categories={categories} onAddCategory={onAddCategory} onRemoveCategory={onRemoveCategory} projects={projects || []} ideas={ideas} />
    </div>
  )
}
