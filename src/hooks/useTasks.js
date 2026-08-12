// Hook: useTasks
// Purpose: Task CRUD — localStorage fallback with optional Supabase sync + real-time.
//          Fixes: delete race condition, || synced overwrite bug, realtime dedup guard.
import { useState, useEffect, useCallback, useRef } from 'react'
import { scopedStorage }  from '../services/storage'
import { storageScope }   from '../services/scopedStorage'
import { tasksService }   from '../services/supabaseDataService'
import { subscribeToTable } from '../services/realtimeService'
import { useAuth }        from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'
import { withRetry }      from '../utils/withRetry'
import { getTodayKey }    from '../utils/dateUtils'
import { computeReminderAt } from '../utils/reminders'

const KEY = 'tasks'

export function useTasks() {
  const { user }  = useAuth()
  const userId    = user?.id
  const useDB     = isSupabaseConfigured() && !!userId
  const scope     = storageScope(userId, isSupabaseConfigured())

  const [tasks, setTasks]   = useState(() => scopedStorage.get(scope, KEY, []))
  const [synced, setSynced] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const loadedScopeRef = useRef(scope)

  // Track IDs we've locally deleted — prevents realtime from restoring them
  // before the Supabase DELETE has committed
  const pendingDeletesRef = useRef(new Set())

  // ── Load from Supabase on mount / user change ──────────────────────────────
  useEffect(() => {
    let active = true
    setSynced(false)
    setSyncError(null)
    const fallback = scope === 'demo' ? scopedStorage.readLegacy(KEY, []) : []
    const cached = scopedStorage.get(scope, KEY, fallback)
    setTasks(cached)
    if (!useDB) { setSynced(true); return () => { active = false } }

    tasksService.getAll(userId).then(result => {
      if (!active) return
      if (result.ok) {
        const filtered = result.value.filter(r => !pendingDeletesRef.current.has(r.id))
        setTasks(filtered)
        scopedStorage.set(scope, KEY, filtered)
      } else {
        setSyncError(result.error)
      }
      setSynced(true)
    })
    return () => { active = false }
  }, [scope, useDB, userId])

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('tasks', userId, () => {
      tasksService.getAll(userId).then(result => {
        if (!result.ok) { setSyncError(result.error); return }
        const filtered = result.value.filter(r => !pendingDeletesRef.current.has(r.id))
        setTasks(filtered)
        scopedStorage.set(scope, KEY, filtered)
      })
    })
  }, [scope, useDB, userId])

  // ── Persist to localStorage when offline ──────────────────────────────────
  useEffect(() => {
    if (loadedScopeRef.current !== scope) {
      loadedScopeRef.current = scope
      return
    }
    scopedStorage.set(scope, KEY, tasks)
  }, [scope, tasks])

  const persist = useCallback(async (task) => {
    if (useDB) await tasksService.upsert(userId, task)
  }, [useDB, userId])

  const remove = useCallback(async (id) => {
    if (useDB) {
      // FIX: mark as pending delete BEFORE the async call
      // This prevents the realtime listener from restoring it
      pendingDeletesRef.current.add(id)
      await tasksService.delete(userId, id)
      // Keep in pending set for 3s to absorb any delayed realtime events
      setTimeout(() => pendingDeletesRef.current.delete(id), 3000)
    }
  }, [useDB, userId])

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
    pendingDeletesRef.current.delete(t.id)
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
      withRetry(() => persist(targetTask), {
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
    tasks, synced, syncError, addTask, restoreTask, updateTask, deleteTask, toggleTask, setFocus,
    getTodayTasks, getTasksByDate, getFocusTask,
    getTotalEstimateMins, isOverdue, isDueToday,
  }
}
