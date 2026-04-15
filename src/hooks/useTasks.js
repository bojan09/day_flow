// Hook: useTasks
// Purpose: Task CRUD — localStorage fallback with optional Supabase sync + real-time
import { useState, useEffect, useCallback } from 'react'
import { storage } from '../services/storage'
import { tasksService } from '../services/supabaseDataService'
import { subscribeToTable } from '../services/realtimeService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'
import { getTodayKey } from '../utils/dateUtils'

const KEY = 'tasks'

export function useTasks() {
  const { user }  = useAuth()
  const userId    = user?.id
  const useDB     = isSupabaseConfigured() && !!userId

  const [tasks, setTasks]   = useState(() => storage.get(KEY, []))
  const [synced, setSynced] = useState(false)

  // Load from Supabase on mount / user change
  useEffect(() => {
    if (!useDB) { setSynced(true); return }
    tasksService.getAll(userId).then(rows => {
      if (rows.length > 0 || synced) {
        setTasks(rows)
        storage.set(KEY, rows)
      }
      setSynced(true)
    })
  }, [userId])

  // Real-time subscription
  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('tasks', userId, () => {
      tasksService.getAll(userId).then(rows => {
        setTasks(rows)
        storage.set(KEY, rows)
      })
    })
  }, [userId])

  // Persist to localStorage always
  useEffect(() => { if (!useDB) storage.set(KEY, tasks) }, [tasks])

  const persist = useCallback(async (task) => {
    if (useDB) await tasksService.upsert(userId, task)
  }, [useDB, userId])

  const remove = useCallback(async (id) => {
    if (useDB) await tasksService.delete(userId, id)
  }, [useDB, userId])

  const addTask = (task) => {
    const t = {
      id: Date.now().toString(), title: task.title?.trim() || '',
      priority: task.priority || 'medium', category: task.category || 'Personal',
      date: task.date || getTodayKey(), completed: false, completedAt: null,
      isFocus: false, estimateMins: task.estimateMins || null,
      isRecurring: task.isRecurring || false, recurDays: task.recurDays || [],
      recurringFrom: task.recurringFrom || null, projectId: task.projectId || null,
      subTasks: task.subTasks || [], notes: task.notes || '',
      createdAt: new Date().toISOString(),
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
    setTasks(prev => prev.filter(t => t.id !== id))
    remove(id)
  }

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const updated = { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
      persist(updated)
      return updated
    }))
  }

  const setFocus = (id) => {
    setTasks(prev => prev.map(t => {
      const updated = { ...t, isFocus: t.id === id ? !t.isFocus : false }
      if (t.isFocus !== updated.isFocus) persist(updated)
      return updated
    }))
  }

  const getTasksByDate   = (dateKey) => tasks.filter(t => t.date === dateKey)
  const getTodayTasks    = ()        => getTasksByDate(getTodayKey())
  const getFocusTask     = ()        => tasks.find(t => t.isFocus && t.date === getTodayKey()) || null
  const getTotalEstimateMins = (dateKey = getTodayKey()) =>
    getTasksByDate(dateKey).reduce((s, t) => s + (t.estimateMins || 0), 0)
  const isOverdue        = (task)    => task.date < getTodayKey() && !task.completed
  const isDueToday       = (task)    => task.date === getTodayKey() && !task.completed

  return {
    tasks, synced, addTask, updateTask, deleteTask, toggleTask, setFocus,
    getTodayTasks, getTasksByDate, getFocusTask,
    getTotalEstimateMins, isOverdue, isDueToday,
  }
}
