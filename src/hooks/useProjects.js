// Hook: useProjects
// Purpose: Project containers. Sync/realtime/guards live in useSyncedCollection.
import { projectsService } from '../services/supabaseDataService'
import { useSyncedCollection } from './useSyncedCollection'

export const PROJECT_STATUSES   = ['Active', 'On Hold', 'Done']
export const PROJECT_CATEGORIES = ['Work', 'Personal', 'Creative', 'Learning', 'Health', 'Other']

export function useProjects() {
  const {
    items: projects, setItems: setProjects, synced, useDB, userId, persist, remove,
  } = useSyncedCollection({ storageKey: 'projects', table: 'projects', service: projectsService })

  const addProject = (data) => {
    const p = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, name: data.name.trim(), description: data.description || '',
      category: data.category || 'Personal', status: 'Active', color: data.color || '#3B6B4B',
      dueDate: data.dueDate || '', createdAt: new Date().toISOString(),
      ...(useDB ? { user_id: userId } : {}),
    }
    setProjects(prev => [p, ...prev]); persist(p); return p
  }

  const updateProject = (id, updates) => {
    const current = projects.find(p => p.id === id)
    if (!current) return
    const u = { ...current, ...updates }
    setProjects(prev => prev.map(p => (p.id === id ? u : p)))
    persist(u)
  }
  const deleteProject = (id)          => { setProjects(prev => prev.filter(p => p.id !== id)); remove(id) }
  const setStatus     = (id, status)  => updateProject(id, { status })
  const getProgress   = (projectId, allTasks) => { const t = allTasks.filter(x => x.projectId === projectId); return t.length ? Math.round((t.filter(x => x.completed).length / t.length) * 100) : 0 }
  const getTaskCount  = (projectId, allTasks) => allTasks.filter(t => t.projectId === projectId).length

  return { projects, synced, addProject, updateProject, deleteProject, setStatus, getProgress, getTaskCount }
}
