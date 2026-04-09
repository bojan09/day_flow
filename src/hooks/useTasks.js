// Hook: useTasks
// Purpose: Full task CRUD — focus, estimates, recurring, sub-tasks, project linking, overdue detection
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { getTodayKey, getDateKey } from '../utils/dateUtils'

const KEY = 'tasks'

export function useTasks() {
  const [tasks, setTasks] = useState(() => storage.get(KEY, []))
  useEffect(() => { storage.set(KEY, tasks) }, [tasks])

  const addTask = (task) => {
    const t = {
      id:            Date.now().toString(),
      title:         task.title?.trim() || '',
      priority:      task.priority      || 'medium',
      category:      task.category      || 'Personal',
      date:          task.date          || getTodayKey(),
      completed:     false,
      completedAt:   null,
      isFocus:       false,
      estimateMins:  task.estimateMins  || null,
      isRecurring:   task.isRecurring   || false,
      recurDays:     task.recurDays     || [],
      recurringFrom: task.recurringFrom || null,
      projectId:     task.projectId     || null,
      subTasks:      task.subTasks      || [],
      notes:         task.notes         || '',
      createdAt:     new Date().toISOString(),
    }
    setTasks(prev => [t, ...prev])
    return t
  }

  const updateTask  = (id, updates) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))

  const deleteTask  = (id) => setTasks(prev => prev.filter(t => t.id !== id))

  const toggleTask  = (id) =>
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
        : t
    ))

  const setFocus = (id) =>
    setTasks(prev => prev.map(t => ({ ...t, isFocus: t.id === id ? !t.isFocus : false })))

  const getTasksByDate      = (dateKey) => tasks.filter(t => t.date === dateKey)
  const getTodayTasks       = ()        => getTasksByDate(getTodayKey())
  const getFocusTask        = ()        => tasks.find(t => t.isFocus && t.date === getTodayKey()) || null
  const getTotalEstimateMins = (dateKey = getTodayKey()) =>
    getTasksByDate(dateKey).reduce((s, t) => s + (t.estimateMins || 0), 0)

  const isOverdue  = (task) => task.date < getTodayKey() && !task.completed
  const isDueToday = (task) => task.date === getTodayKey() && !task.completed

  return {
    tasks, addTask, updateTask, deleteTask, toggleTask, setFocus,
    getTodayTasks, getTasksByDate, getFocusTask,
    getTotalEstimateMins, isOverdue, isDueToday,
  }
}
