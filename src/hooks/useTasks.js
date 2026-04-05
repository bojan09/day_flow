// Hook: Task CRUD state management backed by localStorage
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'
import { getTodayKey, getDateKey } from '../utils/dateUtils'

const KEY = 'tasks'

export function useTasks() {
  const [tasks, setTasks] = useState(() => storage.get(KEY, []))

  useEffect(() => { storage.set(KEY, tasks) }, [tasks])

  const addTask = (task) => {
    const newTask = {
      id:          Date.now().toString(),
      title:       task.title.trim(),
      priority:    task.priority   || 'medium',
      category:    task.category   || 'Personal',
      date:        task.date       || getTodayKey(),
      completed:   false,
      completedAt: null,
      createdAt:   new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])
  }

  const updateTask = (id, updates) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))

  const deleteTask = (id) =>
    setTasks(prev => prev.filter(t => t.id !== id))

  const toggleTask = (id) =>
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
        : t
    ))

  const getTasksByDate = (dateKey) => tasks.filter(t => t.date === dateKey)

  const getTodayTasks = () => getTasksByDate(getTodayKey())

  return { tasks, addTask, updateTask, deleteTask, toggleTask, getTodayTasks, getTasksByDate }
}
