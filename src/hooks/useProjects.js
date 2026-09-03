// Hook: useProjects
// Purpose: Project containers with Supabase sync + real-time
import { useState, useEffect, useCallback, useRef } from 'react'
import { storage } from '../services/storage'
import { projectsService } from '../services/supabaseDataService'
import { subscribeToTable } from '../services/realtimeService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'

const KEY = 'projects'
export const PROJECT_STATUSES   = ['Active', 'On Hold', 'Done']
export const PROJECT_CATEGORIES = ['Work', 'Personal', 'Creative', 'Learning', 'Health', 'Other']

export function useProjects() {
  const { user }  = useAuth()
  const userId    = user?.id
  const useDB            = isSupabaseConfigured() && !!userId
  const [synced, setSynced] = useState(false)

  const [projects, setProjects] = useState(() => storage.get(KEY, []))

  // Track in-flight local writes (add/update/status) keyed by project id, so a
  // realtime-triggered refetch racing ahead of its own write's commit can't
  // silently revert the optimistic update.
  const pendingWritesRef = useRef(new Map())

  const reconcile = (rows) => {
    if (pendingWritesRef.current.size === 0) return rows
    const byId = new Map(rows.map(r => [r.id, r]))
    for (const [id, localProject] of pendingWritesRef.current) byId.set(id, localProject)
    return [...byId.values()]
  }

  useEffect(() => {
    if (!useDB) return
    projectsService.getAll(userId).then(rows => { if (rows.length > 0) { const merged = reconcile(rows); setProjects(merged); storage.set(KEY, merged) }; setSynced(true) })
  }, [userId])

  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('projects', userId, () =>
      projectsService.getAll(userId).then(rows => { const merged = reconcile(rows); setProjects(merged); storage.set(KEY, merged) })
    )
  }, [userId])

  useEffect(() => { if (!useDB) storage.set(KEY, projects) }, [projects])

  const persist = useCallback(async (p) => {
    if (!useDB) return
    pendingWritesRef.current.set(p.id, p)
    try {
      await projectsService.upsert(userId, p)
      setTimeout(() => pendingWritesRef.current.delete(p.id), 3000)
    } catch (err) {
      pendingWritesRef.current.delete(p.id)
      throw err
    }
  }, [useDB, userId])

  const addProject = (data) => {
    const p = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, name: data.name.trim(), description: data.description || '',
      category: data.category || 'Personal', status: 'Active', color: data.color || '#3B6B4B',
      dueDate: data.dueDate || '', createdAt: new Date().toISOString(),
      ...(useDB ? { user_id: userId } : {}),
    }
    setProjects(prev => [p, ...prev]); persist(p); return p
  }

  const updateProject = (id, updates) => setProjects(prev => prev.map(p => { if (p.id !== id) return p; const u = { ...p, ...updates }; persist(u); return u }))
  const deleteProject = (id)          => { setProjects(prev => prev.filter(p => p.id !== id)); if (useDB) projectsService.delete(userId, id) }
  const setStatus     = (id, status)  => updateProject(id, { status })
  const getProgress   = (projectId, allTasks) => { const t = allTasks.filter(x => x.projectId === projectId); return t.length ? Math.round((t.filter(x => x.completed).length / t.length) * 100) : 0 }
  const getTaskCount  = (projectId, allTasks) => allTasks.filter(t => t.projectId === projectId).length

  return { projects, synced, addProject, updateProject, deleteProject, setStatus, getProgress, getTaskCount }
}
