// Hook: useIdeas
// Purpose: Idea tracker — capture, rate, status-track, and convert ideas to tasks
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'

const KEY = 'ideas'

export const IDEA_STATUSES    = ['Raw', 'Developing', 'Action', 'Archived']
export const IDEA_CATEGORIES  = ['Business', 'Creative', 'Personal', 'Technical', 'Learning', 'Other']

export function useIdeas() {
  const [ideas, setIdeas] = useState(() => storage.get(KEY, []))
  useEffect(() => { storage.set(KEY, ideas) }, [ideas])

  const addIdea = (data) => {
    const idea = {
      id:          Date.now().toString(),
      title:       data.title.trim(),
      description: data.description || '',
      category:    data.category    || 'Other',
      status:      'Raw',
      stars:       0,
      tags:        data.tags        || [],
      linkedGoalId:null,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    setIdeas(prev => [idea, ...prev])
    return idea
  }

  const updateIdea  = (id, updates) =>
    setIdeas(prev => prev.map(i =>
      i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
    ))

  const deleteIdea  = (id)   => setIdeas(prev => prev.filter(i => i.id !== id))
  const setStatus   = (id, status) => updateIdea(id, { status })
  const setStars    = (id, stars)  => updateIdea(id, { stars })
  const linkGoal    = (id, goalId) => updateIdea(id, { linkedGoalId: goalId })

  // Returns a random idea not touched in 30+ days
  const getRandomOldIdea = () => {
    const cutoff = Date.now() - 30 * 86400000
    const old = ideas.filter(i => new Date(i.updatedAt).getTime() < cutoff && i.status !== 'Archived')
    return old.length > 0 ? old[Math.floor(Math.random() * old.length)] : null
  }

  return { ideas, addIdea, updateIdea, deleteIdea, setStatus, setStars, linkGoal, getRandomOldIdea }
}
