// Hook: useTasks
// Purpose: Task CRUD. Sync/realtime/optimistic-write guards live in
//          useSyncedCollection; this file owns task-specific behaviour only
//          (reminder recomputation, focus task, completion toggle + rollback).
import { tasksService }   from '../services/supabaseDataService'
import { useSyncedCollection } from './useSyncedCollection'
import { getTodayKey }    from '../utils/dateUtils'
import { computeReminderAt } from '../utils/reminders'

export function useTasks() {
  const {
    items: tasks, setItems: setTasks, synced, useDB, userId, persist, remove, unmarkDeleted,
  } = useSyncedCollection({ storageKey: 'tasks', table: 'tasks', service: tasksService })

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const addTask = (task) => {
    const t = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      title:        task.title?.trim()      || '',
      priority:     task.priority           || 'medium',
      category:     task.category           || 'Personal',
      date:         task.date               || getTodayKey(),
      completed:    false,
      completedAt:  null,
      isFocus:      false,
      estimateMins: task.estimateMins       || null,
      dueTime:      task.dueTime            || '',
      customMins:   task.customMins         || '',
      isRecurring:  task.isRecurring        || false,
      recurDays:    task.recurDays          || [],
      recurStatus:  task.recurStatus        || 'active',
      recurEndDate: task.recurEndDate       || null,
      recurringFrom: task.recurringFrom     || null,
      projectId:    task.projectId          || null,
      subTasks:     task.subTasks           || [],
      notes:        task.notes              || '',
      reminderTime: task.reminderTime       || '',
      reminderAt:   computeReminderAt(task.date || getTodayKey(), task.reminderTime),
      reminderSent: false,
      createdAt:    new Date().toISOString(),
      ...(useDB ? { user_id: userId } : {}),
    }
    setTasks(prev => [t, ...prev])
    persist(t)
    return t
  }

  // Restore a previously deleted task with its original id/state (undo)
  const restoreTask = (t) => {
    unmarkDeleted(t.id)
    setTasks(prev => [t, ...prev])
    persist(t)
  }

  // Writes are resolved from current state and performed here, never inside a
  // setState updater. React runs an updater when it processes the update, not
  // when you call setState, so a write placed inside one can be skipped
  // entirely or run twice — which is exactly how toggleTask lost every save.
  const updateTask = (id, updates) => {
    const current = tasks.find(t => t.id === id)
    if (!current) return
    const merged = { ...current, ...updates }
    const newReminderAt = computeReminderAt(merged.date, merged.reminderTime)
    const reminderChanged = newReminderAt !== current.reminderAt
    const updated = {
      ...merged,
      reminderAt: newReminderAt,
      reminderSent: reminderChanged ? false : merged.reminderSent,
    }
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)))
    persist(updated)
  }

  const deleteTask = (id) => {
    // Optimistic remove from UI immediately
    setTasks(prev => prev.filter(t => t.id !== id))
    remove(id)
  }

  const toggleTask = (id) => {
    // BUG FIX: targetTask used to be assigned inside the setTasks updater and
    // read on the very next line. React had not run that updater yet, so it was
    // still null and persist() never fired — the checkbox flipped, no request
    // was ever sent, and the change was gone on the next load. Deletes were
    // unaffected because they call remove(id) directly, which is why deleting
    // stuck while completing did not.
    const current = tasks.find(t => t.id === id)
    if (!current) return
    const targetTask = {
      ...current,
      completed: !current.completed,
      completedAt: !current.completed ? new Date().toISOString() : null,
    }
    setTasks(prev => prev.map(t => (t.id === id ? targetTask : t)))
    // persist() already retries and toasts; onFail only undoes the optimistic
    // flip so the checkbox stops claiming a save that never landed.
    persist(targetTask, {
      onFail: () => {
        setTasks(prev => prev.map(t => (t.id === id ? current : t)))
      },
    })
  }

  const setFocus = (id) => {
    const next = tasks.map(t => ({ ...t, isFocus: t.id === id ? !t.isFocus : false }))
    setTasks(next)
    // Only the rows whose focus flag actually moved need writing.
    next.forEach((t, i) => { if (t.isFocus !== tasks[i].isFocus) persist(t) })
  }

  const getTasksByDate       = (dateKey) => tasks.filter(t => t.date === dateKey)
  const getTodayTasks        = ()        => getTasksByDate(getTodayKey())
  const getFocusTask         = ()        => tasks.find(t => t.isFocus && t.date === getTodayKey()) || null
  const getTotalEstimateMins = (dateKey = getTodayKey()) =>
    getTasksByDate(dateKey).reduce((s, t) => s + (t.estimateMins || 0), 0)
  const isOverdue  = (task) => task.date < getTodayKey() && !task.completed
  const isDueToday = (task) => task.date === getTodayKey() && !task.completed

  return {
    tasks, synced, addTask, restoreTask, updateTask, deleteTask, toggleTask, setFocus,
    getTodayTasks, getTasksByDate, getFocusTask,
    getTotalEstimateMins, isOverdue, isDueToday,
  }
}
