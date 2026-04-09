// Hook: useProjects
// Purpose: Lightweight project containers that group related tasks
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'

const KEY = 'projects'

export const PROJECT_STATUSES   = ['Active', 'On Hold', 'Done']
export const PROJECT_CATEGORIES = ['Work', 'Personal', 'Creative', 'Learning', 'Health', 'Other']

export function useProjects() {
  const [projects, setProjects] = useState(() => storage.get(KEY, []))
  useEffect(() => { storage.set(KEY, projects) }, [projects])

  const addProject = (data) => {
    const p = {
      id:          Date.now().toString(),
      name:        data.name.trim(),
      description: data.description || '',
      category:    data.category    || 'Personal',
      status:      'Active',
      color:       data.color       || '#3B6B4B',
      dueDate:     data.dueDate     || '',
      createdAt:   new Date().toISOString(),
    }
    setProjects(prev => [p, ...prev])
    return p
  }

  const updateProject = (id, updates) =>
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))

  const deleteProject = (id) => setProjects(prev => prev.filter(p => p.id !== id))

  const setStatus = (id, status) => updateProject(id, { status })

  // Compute progress from tasks associated with this project
  const getProgress = (projectId, allTasks) => {
    const projectTasks = allTasks.filter(t => t.projectId === projectId)
    if (!projectTasks.length) return 0
    const done = projectTasks.filter(t => t.completed).length
    return Math.round((done / projectTasks.length) * 100)
  }

  const getTaskCount = (projectId, allTasks) =>
    allTasks.filter(t => t.projectId === projectId).length

  return { projects, addProject, updateProject, deleteProject, setStatus, getProgress, getTaskCount }
}
