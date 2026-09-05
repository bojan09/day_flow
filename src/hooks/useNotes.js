// Hook: useNotes
// Purpose: Notes CRUD with tags and word count.
//          Sync/realtime/guards live in useSyncedCollection.
import { notesService } from '../services/supabaseDataService'
import { useSyncedCollection } from './useSyncedCollection'

export const NOTE_TAGS = ['journal', 'idea', 'work', 'reflection', 'personal', 'learning']

export function useNotes() {
  const {
    items: notes, setItems: setNotes, synced, useDB, userId, persist, remove, unmarkDeleted,
  } = useSyncedCollection({ storageKey: 'notes', table: 'notes', service: notesService })

  const addNote = (partial = {}) => {
    const note = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, title: partial.title || 'Untitled',
      content: partial.content || '', tags: partial.tags || [], pinned: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      ...(useDB ? { user_id: userId } : {}),
    }
    setNotes(prev => [note, ...prev])
    persist(note)
    return note
  }

  const updateNote = (id, updates) => {
    const current = notes.find(n => n.id === id)
    if (!current) return
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() }
    setNotes(prev => prev.map(n => (n.id === id ? updated : n)))
    persist(updated)
  }

  // Restore a previously deleted note with its original id/content (undo)
  const restoreNote = (n) => {
    unmarkDeleted(n.id)
    setNotes(prev => [n, ...prev])
    persist(n)
  }

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    remove(id)
  }

  const togglePin = (id) => updateNote(id, { pinned: !notes.find(n => n.id === id)?.pinned })

  const getWordCount = (content = '') => content.trim().split(/\s+/).filter(Boolean).length
  const getReadTime  = (content = '') => Math.max(1, Math.round(getWordCount(content) / 200))

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  return { notes: sorted, synced, addNote, restoreNote, updateNote, deleteNote, togglePin, getWordCount, getReadTime }
}
