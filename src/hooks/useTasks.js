// Hook: useTasks
// Purpose: Task CRUD — localStorage fallback with optional Supabase sync + real-time.
//          Fixes: delete race condition, || synced overwrite bug, realtime dedup guard.
import { useState, useEffect, useCallback, useRef } from 'react'
import { storage }        from '../services/storage'
import { tasksService }   from '../services/supabaseDataService'
import { subscribeToTable } from '../services/realtimeService'
import { useAuth }        from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'
import { withRetry }      from '../utils/withRetry'
import { getTodayKey }    from '../utils/dateUtils'

const KEY = 'tasks'

export function useTasks() {
  const { user }  = useAuth()
  const userId    = user?.id
  const useDB     = isSupabaseConfigured() && !!userId

  const [tasks, setTasks]   = useState(() => storage.get(KEY, []))
  const [synced, setSynced] = useState(false)

  // Track IDs we've locally deleted — prevents realtime from restoring them
  // before the Supabase DELETE has committed
  const pendingDeletesRef = useRef(new Set())

  // ── Load from Supabase on mount / user change ──────────────────────────────
  useEffect(() => {
    if (!useDB) { setSynced(true); return }
    tasksService.getAll(userId).then(rows => {
      // FIX: never overwrite with empty — only update if Supabase returned data
      if (rows.length > 0) {
        // Filter out any pending local deletes that haven't committed yet
        const filtered = rows.filter(r => !pendingDeletesRef.current.has(r.id))
        setTasks(filtered)
        storage.set(KEY, filtered)
      }
      setSynced(true)
    })
  }, [userId])

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('tasks', userId, () => {
      tasksService.getAll(userId).then(rows => {
        // FIX: filter out pending deletes before applying realtime update
        const filtered = rows.filter(r => !pendingDeletesRef.current.has(r.id))
        setTasks(filtered)
        storage.set(KEY, filtered)
      })
    })
  }, [userId])

  // ── Persist to localStorage when offline ──────────────────────────────────
  useEffect(() => { if (!useDB) storage.set(KEY, tasks) }, [tasks])

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
      recurringFrom: task.recurringFrom     || null,
      projectId:    task.projectId          || null,
      subTasks:     task.subTasks           || [],
      notes:        task.notes              || '',
      createdAt:    new Date().toISOString(),
      ...(useDB ? { user_id: userId } : {}),
    }
    setTasks(prev => [t, ...prev])
    persist(t)
    return t
  }

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const updated = { ...t, ...updates }
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
    tasks, synced, addTask, updateTask, deleteTask, toggleTask, setFocus,
    getTodayTasks, getTasksByDate, getFocusTask,
    getTotalEstimateMins, isOverdue, isDueToday,
  }
}
