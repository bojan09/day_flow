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
import { computeReminderAt } from '../utils/reminders'

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

  // Track in-flight local writes (add/update/toggle/setFocus) keyed by task id.
  // BUG FIX: the realtime listener fires on the client's OWN writes too (Supabase
  // echoes them back), and used to unconditionally overwrite `tasks` with a fresh
  // getAll() fetch — if that fetch raced ahead of the write actually committing,
  // it silently reverted the optimistic update (e.g. toggling a task complete,
  // then navigating/refreshing before the echo settled, showed it incomplete
  // again). Any row with a pending local write is now preserved as-is instead of
  // being clobbered by a remote read that may still be stale.
  const pendingWritesRef = useRef(new Map())

  // Merge freshly-fetched rows with any pending local writes / deletes so a
  // remote read can never regress a write that's still in flight.
  const reconcile = (rows) => {
    const filtered = rows.filter(r => !pendingDeletesRef.current.has(r.id))
    if (pendingWritesRef.current.size === 0) return filtered
    const byId = new Map(filtered.map(r => [r.id, r]))
    for (const [id, localTask] of pendingWritesRef.current) {
      byId.set(id, localTask)
    }
    return [...byId.values()]
  }

  // ── Load from Supabase on mount / user change ──────────────────────────────
  useEffect(() => {
    if (!useDB) { setSynced(true); return }
    tasksService.getAll(userId).then(rows => {
      // FIX: never overwrite with empty — only update if Supabase returned data
      if (rows.length > 0) {
        const merged = reconcile(rows)
        setTasks(merged)
        storage.set(KEY, merged)
      }
      setSynced(true)
    })
  }, [userId])

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('tasks', userId, () => {
      tasksService.getAll(userId).then(rows => {
        const merged = reconcile(rows)
        setTasks(merged)
        storage.set(KEY, merged)
      })
    })
  }, [userId])

  // ── Persist to localStorage when offline ──────────────────────────────────
  useEffect(() => { if (!useDB) storage.set(KEY, tasks) }, [tasks])

  const persist = useCallback(async (task) => {
    if (!useDB) return
    pendingWritesRef.current.set(task.id, task)
    try {
      await tasksService.upsert(userId, task)
      // BUG FIX: clearing the guard immediately here is NOT safe — a getAll()
      // that was already in-flight when this write started (e.g. the initial
      // mount load, or a realtime refetch from an unrelated prior event)
      // reflects DB state as of when IT queried, not as of when it resolves.
      // If that older fetch resolves shortly after this write commits, it can
      // still overwrite the just-written value with pre-write data even
      // though the guard was "correctly" cleared the instant the write
      // succeeded. Keep the guard for a few seconds after success (same
      // grace-period pattern already used for pendingDeletesRef below) so any
      // already-in-flight fetch gets reconciled against the true local value
      // instead of winning the race.
      setTimeout(() => pendingWritesRef.current.delete(task.id), 3000)
    } catch (err) {
      // Clear the guard on failure — the write never landed, so there's
      // nothing to protect; the caller's own onFail rollback (see toggleTask)
      // is what reconciles the UI here, and a fresh fetch should be trusted.
      pendingWritesRef.current.delete(task.id)
      throw err
    }
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
    tasks, synced, addTask, restoreTask, updateTask, deleteTask, toggleTask, setFocus,
    getTodayTasks, getTasksByDate, getFocusTask,
    getTotalEstimateMins, isOverdue, isDueToday,
  }
}
