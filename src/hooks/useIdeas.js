// Hook: useIdeas
// Purpose: Idea tracker with status, ratings, goal links, Supabase sync + real-time
import { useState, useEffect, useCallback, useRef } from 'react'
import { scopedStorage } from '../services/storage'
import { storageScope } from '../services/scopedStorage'
import { ideasService } from '../services/supabaseDataService'
import { subscribeToTable } from '../services/realtimeService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'

const KEY = 'ideas'
export const IDEA_STATUSES   = ['Raw', 'Developing', 'Action', 'Archived']
export const IDEA_CATEGORIES = ['Business', 'Creative', 'Personal', 'Technical', 'Learning', 'Other']

export function useIdeas() {
  const { user }  = useAuth()
  const userId    = user?.id
  const useDB            = isSupabaseConfigured() && !!userId
  const scope            = storageScope(userId, isSupabaseConfigured())
  const [synced, setSynced] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const loadedScopeRef = useRef(scope)

  const [ideas, setIdeas] = useState(() => scopedStorage.get(scope, KEY, []))

  useEffect(() => {
    let active = true
    setSynced(false); setSyncError(null)
    const fallback = scope === 'demo' ? scopedStorage.readLegacy(KEY, []) : []
    setIdeas(scopedStorage.get(scope, KEY, fallback))
    if (!useDB) { setSynced(true); return () => { active = false } }
    ideasService.getAll(userId).then(result => {
      if (!active) return
      if (result.ok) { setIdeas(result.value); scopedStorage.set(scope, KEY, result.value) }
      else setSyncError(result.error)
      setSynced(true)
    })
    return () => { active = false }
  }, [scope, useDB, userId])

  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('ideas', userId, () =>
      ideasService.getAll(userId).then(result => {
        if (result.ok) { setIdeas(result.value); scopedStorage.set(scope, KEY, result.value) }
        else setSyncError(result.error)
      })
    )
  }, [scope, useDB, userId])

  useEffect(() => {
    if (loadedScopeRef.current !== scope) { loadedScopeRef.current = scope; return }
    scopedStorage.set(scope, KEY, ideas)
  }, [ideas, scope])

  const persist = useCallback(async (idea) => { if (useDB) await ideasService.upsert(userId, idea) }, [useDB, userId])

  const addIdea = (data) => {
    const idea = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, title: data.title.trim(), description: data.description || '',
      category: data.category || 'Other', status: 'Raw', stars: 0,
      tags: data.tags || [], linkedGoalId: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      ...(useDB ? { user_id: userId } : {}),
    }
    setIdeas(prev => [idea, ...prev]); persist(idea); return idea
  }

  const updateIdea = (id, updates) => setIdeas(prev => prev.map(i => {
    if (i.id !== id) return i
    const u = { ...i, ...updates, updatedAt: new Date().toISOString() }; persist(u); return u
  }))

  // Restore a previously deleted idea with its original id (undo)
  const restoreIdea = (i) => { setIdeas(prev => [i, ...prev]); persist(i) }

  const deleteIdea = (id) => { setIdeas(prev => prev.filter(i => i.id !== id)); if (useDB) ideasService.delete(userId, id) }
  const setStatus  = (id, status) => updateIdea(id, { status })
  const setStars   = (id, stars)  => updateIdea(id, { stars })
  const linkGoal   = (id, goalId) => updateIdea(id, { linkedGoalId: goalId })

  const getRandomOldIdea = () => {
    const cutoff = Date.now() - 30 * 86400000
    const old = ideas.filter(i => new Date(i.updatedAt).getTime() < cutoff && i.status !== 'Archived')
    return old.length > 0 ? old[Math.floor(Math.random() * old.length)] : null
  }

  return { ideas, synced, syncError, addIdea, restoreIdea, updateIdea, deleteIdea, setStatus, setStars, linkGoal, getRandomOldIdea }
}
