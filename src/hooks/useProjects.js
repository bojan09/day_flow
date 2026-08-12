// Hook: useProjects
// Purpose: Project containers with Supabase sync + real-time
import { useState, useEffect, useCallback, useRef } from 'react'
import { scopedStorage } from '../services/storage'
import { storageScope } from '../services/scopedStorage'
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
  const scope            = storageScope(userId, isSupabaseConfigured())
  const [synced, setSynced] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const loadedScopeRef = useRef(scope)

  const [projects, setProjects] = useState(() => scopedStorage.get(scope, KEY, []))

  useEffect(() => {
    let active = true
    setSynced(false); setSyncError(null)
    const fallback = scope === 'demo' ? scopedStorage.readLegacy(KEY, []) : []
    setProjects(scopedStorage.get(scope, KEY, fallback))
    if (!useDB) { setSynced(true); return () => { active = false } }
    projectsService.getAll(userId).then(result => {
      if (!active) return
      if (result.ok) { setProjects(result.value); scopedStorage.set(scope, KEY, result.value) }
      else setSyncError(result.error)
      setSynced(true)
    })
    return () => { active = false }
  }, [scope, useDB, userId])

  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('projects', userId, () =>
      projectsService.getAll(userId).then(result => {
        if (result.ok) { setProjects(result.value); scopedStorage.set(scope, KEY, result.value) }
        else setSyncError(result.error)
      })
    )
  }, [scope, useDB, userId])

  useEffect(() => {
    if (loadedScopeRef.current !== scope) { loadedScopeRef.current = scope; return }
    scopedStorage.set(scope, KEY, projects)
  }, [projects, scope])

  const persist = useCallback(async (p) => { if (useDB) await projectsService.upsert(userId, p) }, [useDB, userId])

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

  return { projects, synced, syncError, addProject, updateProject, deleteProject, setStatus, getProgress, getTaskCount }
}
