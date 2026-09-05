import ViewSkeleton from '../ui/ViewSkeleton'
import { useToast } from '../../utils/toast'
// Component: TasksView
// Purpose: Tasks tab — NLP input, color categories, sub-task detail modal, duplicate, templates, someday
import { useState, useCallback, useEffect, useRef } from 'react'
import Modal         from '../ui/Modal'
import TaskForm      from './TaskForm'
import RecurrencePanel from './RecurrencePanel'
import QuickTaskBar          from './QuickTaskBar'

import NLPTaskInput  from './NLPTaskInput'
import TaskDetail    from './TaskDetail'
import TaskSection   from './TaskSection'
import EmptyState    from '../ui/EmptyState'
import TaskTemplates from '../templates/TaskTemplates'
import SomedayList   from '../summary/SomedayList'
import RepeatingView from '../repeating/RepeatingView'
import GoalsView     from '../goals/GoalsView'
import { getTodayKey } from '../../utils/dateUtils'
import { addDays, format } from 'date-fns'
import { useTemplates } from '../../hooks/useTemplates'
import { useSomeday }   from '../../hooks/useSomeday'

const FILTERS = ['All', 'Today', 'Overdue', 'Pending', 'Done', 'Someday', 'Templates', 'Repeating', 'Long-term']

// templates and someday are owned here rather than at the DashboardPage root —
// this view is their only consumer, so hoisting them made every session load
// them even when the Tasks tab was never opened.
export default function TasksView({ tasks, projects, categories, onAddCategory, onRemoveCategory, onTabChange, ideas, openTaskId, workouts, goals, initialFilter }) {
  const { toast } = useToast()
  const templates = useTemplates()
  const someday   = useSomeday()
  const [recurTask, setRecurTask] = useState(null)
  const [filter,     setFilter]  = useState(initialFilter || 'Today')
  const [modalOpen,  setModal]   = useState(false)
  const [detailTask,   setDetail]      = useState(null)
  const todayKey = getTodayKey()

  // Deep-link: auto-open the task detail modal when navigated here via a
  // notification tap (?openTask=<id>, handled in DashboardPage).
  // consumedRef tracks which openTaskId we've already auto-opened, so
  // unrelated tasks.tasks mutations (add/update/toggle/delete/sync) don't
  // reopen the modal after the user has closed it.
  const consumedRef = useRef(null)
  useEffect(() => {
    if (openTaskId && consumedRef.current !== openTaskId) {
      const match = tasks.tasks.find(t => t.id === openTaskId)
      if (match) {
        setDetail(match)
        consumedRef.current = openTaskId
      }
    }
  }, [openTaskId, tasks.tasks])

  const filtered = tasks.tasks.filter(t => {
    if (filter === 'Today')   return t.date === todayKey
    if (filter === 'Overdue') return tasks.isOverdue(t)
    if (filter === 'Pending') return !t.completed
    if (filter === 'Done')    return t.completed
    return true
  })
  const byPriority = (a, b) => {
    const p = { high: 0, medium: 1, low: 2 }
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1)
  }

  const overdueTasks  = filtered.filter(t => !t.completed && tasks.isOverdue(t)).sort(byPriority)
  const todayTasks    = filtered.filter(t => !t.completed && t.date === todayKey).sort(byPriority)
  const upcomingTasks = filtered.filter(t => !t.completed && t.date > todayKey).sort(byPriority)
  const doneTasks     = filtered.filter(t => t.completed).sort(byPriority)

  // Declared before the synced early-return below: sitting after it changed
  // the hook count between the skeleton render and the loaded render, which
  // threw "Rendered more hooks than during the previous render" every time
  // tasks finished syncing.
  const handleDelete = useCallback((t) => { tasks.deleteTask(t.id); toast.undo('Task deleted', () => tasks.restoreTask(t)) }, [tasks, toast])

  if (!tasks.synced) return <ViewSkeleton type="tasks" />

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

      {filter === 'Someday' ? (
        someday && <SomedayList someday={someday} tasks={tasks} />
      ) : filter === 'Templates' ? (
        templates && <TaskTemplates templates={templates} tasks={tasks} />
      ) : filter === 'Repeating' ? (
        <RepeatingView tasks={tasks} workouts={workouts} />
      ) : filter === 'Long-term' ? (
        <GoalsView goals={goals} />
      ) : filtered.length === 0 ? (
        <EmptyState type="tasks" title="Nothing here" subtitle="Add a task using the input above." action="+ New Task" onAction={() => setModal(true)} />
      ) : (
        <div className="space-y-5">
          <TaskSection title="Overdue"  tasks={overdueTasks}  urgency="overdue" tasksApi={tasks} projects={projects} onTabChange={onTabChange} onOpenDetail={setDetail} onOpenRecur={setRecurTask} onDelete={handleDelete} />
          <TaskSection title="Today"    tasks={todayTasks}    urgency="today"   tasksApi={tasks} projects={projects} onTabChange={onTabChange} onOpenDetail={setDetail} onOpenRecur={setRecurTask} onDelete={handleDelete} />
          <TaskSection title="Upcoming" tasks={upcomingTasks} urgency="future"  tasksApi={tasks} projects={projects} onTabChange={onTabChange} onOpenDetail={setDetail} onOpenRecur={setRecurTask} onDelete={handleDelete} />
          <TaskSection title="Done"     tasks={doneTasks}     urgency="future"  tasksApi={tasks} projects={projects} onTabChange={onTabChange} onOpenDetail={setDetail} onOpenRecur={setRecurTask} onDelete={handleDelete} />
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModal(false)} title="New Task" fullScreenOnMobile>
        {recurTask && (
          <RecurrencePanel task={recurTask} onUpdate={tasks.updateTask} onClose={() => setRecurTask(null)} />
        )}
        <TaskForm onSubmit={t => { tasks.addTask(t); setModal(false) }} onCancel={() => setModal(false)} projects={projects || []} categories={categories} onAddCategory={onAddCategory} onRemoveCategory={onRemoveCategory} />
      </Modal>

      <TaskDetail task={detailTask} tasks={tasks} isOpen={!!detailTask} onClose={() => setDetail(null)} categories={categories} onAddCategory={onAddCategory} onRemoveCategory={onRemoveCategory} projects={projects || []} ideas={ideas} />
    </div>
  )
}
