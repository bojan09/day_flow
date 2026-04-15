// Hook: useNotes
// Purpose: Notes CRUD with tags, word count, Supabase sync, and real-time
import { useState, useEffect, useCallback } from 'react'
import { storage } from '../services/storage'
import { notesService } from '../services/supabaseDataService'
import { subscribeToTable } from '../services/realtimeService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'

export const NOTE_TAGS = ['journal', 'idea', 'work', 'reflection', 'personal', 'learning']
const KEY = 'notes'

export function useNotes() {
  const { user }  = useAuth()
  const userId    = user?.id
  const useDB     = isSupabaseConfigured() && !!userId

  const [notes, setNotes]   = useState(() => storage.get(KEY, []))
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (!useDB) { setSynced(true); return }
    notesService.getAll(userId).then(rows => {
      if (rows.length > 0 || synced) { setNotes(rows); storage.set(KEY, rows) }
      setSynced(true)
    })
  }, [userId])

  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('notes', userId, () => {
      notesService.getAll(userId).then(rows => { setNotes(rows); storage.set(KEY, rows) })
    })
  }, [userId])

  useEffect(() => { if (!useDB) storage.set(KEY, notes) }, [notes])

  const persist = useCallback(async (note) => {
    if (useDB) await notesService.upsert(userId, note)
  }, [useDB, userId])

  const addNote = (partial = {}) => {
    const note = {
      id: Date.now().toString(), title: partial.title || 'Untitled',
      content: partial.content || '', tags: partial.tags || [], pinned: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      ...(useDB ? { user_id: userId } : {}),
    }
    setNotes(prev => [note, ...prev])
    persist(note)
    return note
  }

  const updateNote = (id, updates) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n
      const updated = { ...n, ...updates, updatedAt: new Date().toISOString() }
      persist(updated)
      return updated
    }))
  }

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (useDB) notesService.delete(userId, id)
  }

  const togglePin = (id) => updateNote(id, { pinned: !notes.find(n => n.id === id)?.pinned })

  const getWordCount = (content = '') => content.trim().split(/\s+/).filter(Boolean).length
  const getReadTime  = (content = '') => Math.max(1, Math.round(getWordCount(content) / 200))

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  return { notes: sorted, synced, addNote, updateNote, deleteNote, togglePin, getWordCount, getReadTime }
}
