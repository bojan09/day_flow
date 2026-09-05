// Hook: useIdeas
// Purpose: Idea tracker with status, ratings, goal links.
//          Sync/realtime/guards live in useSyncedCollection.
import { ideasService } from '../services/supabaseDataService'
import { useSyncedCollection } from './useSyncedCollection'

export const IDEA_STATUSES   = ['Raw', 'Developing', 'Action', 'Archived']
export const IDEA_CATEGORIES = ['Business', 'Creative', 'Personal', 'Technical', 'Learning', 'Other']

export function useIdeas() {
  const {
    items: ideas, setItems: setIdeas, synced, useDB, userId, persist, remove, unmarkDeleted,
  } = useSyncedCollection({ storageKey: 'ideas', table: 'ideas', service: ideasService })

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

  const updateIdea = (id, updates) => {
    const current = ideas.find(i => i.id === id)
    if (!current) return
    const u = { ...current, ...updates, updatedAt: new Date().toISOString() }
    setIdeas(prev => prev.map(i => (i.id === id ? u : i)))
    persist(u)
  }

  // Restore a previously deleted idea with its original id (undo)
  const restoreIdea = (i) => { unmarkDeleted(i.id); setIdeas(prev => [i, ...prev]); persist(i) }

  const deleteIdea = (id) => { setIdeas(prev => prev.filter(i => i.id !== id)); remove(id) }
  const setStatus  = (id, status) => updateIdea(id, { status })
  const setStars   = (id, stars)  => updateIdea(id, { stars })
  const linkGoal   = (id, goalId) => updateIdea(id, { linkedGoalId: goalId })

  const getRandomOldIdea = () => {
    const cutoff = Date.now() - 30 * 86400000
    const old = ideas.filter(i => new Date(i.updatedAt).getTime() < cutoff && i.status !== 'Archived')
    return old.length > 0 ? old[Math.floor(Math.random() * old.length)] : null
  }

  return { ideas, synced, addIdea, restoreIdea, updateIdea, deleteIdea, setStatus, setStars, linkGoal, getRandomOldIdea }
}
