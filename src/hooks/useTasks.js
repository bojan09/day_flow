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

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const merged = { ...t, ...updates }
      const newReminderAt = computeReminderAt(merged.date, merged.reminderTime)
      const reminderChanged = newReminderAt !== t.reminderAt
      const updated = {
        ...merged,
        reminderAt: newReminderAt,
        reminderSent: reminderChanged ? false : merged.reminderSent,
      }
      persist(updated)
      return updated
    }))
  }

  const deleteTask = (id) => {
    // Optimistic remove from UI immediately
    setTasks(prev => prev.filter(t => t.id !== id))
    remove(id)
  }

  const toggleTask = (id) => {
    let targetTask = null
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const updated = { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
      targetTask = updated
      return updated
    }))
    if (targetTask) {
      // persist() already retries and toasts; this only undoes the optimistic
      // flip so the checkbox doesn't keep claiming a save that never landed.
      persist(targetTask, {
        onFail: () => {
          setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, completed: !t.completed, completedAt: t.completed ? null : t.completedAt } : t
          ))
        },
      })
    }
  }

  const setFocus = (id) => {
    setTasks(prev => prev.map(t => {
      const updated = { ...t, isFocus: t.id === id ? !t.isFocus : false }
      if (t.isFocus !== updated.isFocus) persist(updated)
      return updated
    }))
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
