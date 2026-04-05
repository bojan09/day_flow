// Hook: useTasks
// Purpose: Task CRUD with focus task, time estimates, recurring support, localStorage persistence
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { getTodayKey, getDateKey } from '../utils/dateUtils'

const KEY = 'tasks'

export function useTasks() {
  const [tasks, setTasks] = useState(() => storage.get(KEY, []))

  useEffect(() => { storage.set(KEY, tasks) }, [tasks])

  const addTask = (task) => {
    const newTask = {
      id:           Date.now().toString(),
      title:        task.title.trim(),
      priority:     task.priority    || 'medium',
      category:     task.category    || 'Personal',
      date:         task.date        || getTodayKey(),
      completed:    false,
      completedAt:  null,
      isFocus:      false,
      estimateMins: task.estimateMins || null,
      isRecurring:  task.isRecurring  || false,
      recurDays:    task.recurDays    || [],
      createdAt:    new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])
    return newTask
  }

  const updateTask  = (id, updates) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))

  const deleteTask  = (id) =>
    setTasks(prev => prev.filter(t => t.id !== id))

  const toggleTask  = (id) =>
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
        : t
    ))

  // Only one focus task at a time
  const setFocus = (id) =>
    setTasks(prev => prev.map(t => ({ ...t, isFocus: t.id === id ? !t.isFocus : false })))

  const getTasksByDate  = (dateKey) => tasks.filter(t => t.date === dateKey)
  const getTodayTasks   = ()        => getTasksByDate(getTodayKey())
  const getFocusTask    = ()        => tasks.find(t => t.isFocus && t.date === getTodayKey()) || null

  const getTotalEstimateMins = (dateKey = getTodayKey()) =>
    getTasksByDate(dateKey).reduce((sum, t) => sum + (t.estimateMins || 0), 0)

  // Overdue = date is before today and not completed
  const isOverdue = (task) => task.date < getTodayKey() && !task.completed
  const isDueToday = (task) => task.date === getTodayKey() && !task.completed

  return {
    tasks, addTask, updateTask, deleteTask, toggleTask,
    setFocus, getTodayTasks, getTasksByDate, getFocusTask,
    getTotalEstimateMins, isOverdue, isDueToday,
  }
}
