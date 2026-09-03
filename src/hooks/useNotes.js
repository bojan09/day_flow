// Hook: useNotes
// Purpose: Notes CRUD with tags, word count, Supabase sync, and real-time
import { useState, useEffect, useCallback, useRef } from 'react'
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
  const useDB            = isSupabaseConfigured() && !!userId
  const pendingDeletesRef = useRef(new Set())

  // Track in-flight local writes (add/update/pin) keyed by note id, so a
  // realtime-triggered refetch racing ahead of its own write's commit can't
  // silently revert the optimistic update.
  const pendingWritesRef = useRef(new Map())

  const [notes, setNotes]   = useState(() => storage.get(KEY, []))
  const [synced, setSynced] = useState(false)

  const reconcile = (rawRows) => {
    const filtered = rawRows.filter(n => !pendingDeletesRef.current.has(n.id))
    if (pendingWritesRef.current.size === 0) return filtered
    const byId = new Map(filtered.map(n => [n.id, n]))
    for (const [id, localNote] of pendingWritesRef.current) byId.set(id, localNote)
    return [...byId.values()]
  }

  useEffect(() => {
    if (!useDB) { setSynced(true); return }
    notesService.getAll(userId).then(rows => {
      if (rows.length > 0) { const merged = reconcile(rows); setNotes(merged); storage.set(KEY, merged) }
      setSynced(true)
    })
  }, [userId])

  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('notes', userId, () => {
      notesService.getAll(userId).then(rawRows => {
        const rows = reconcile(rawRows)
        if (rows.length > 0) { setNotes(rows); storage.set(KEY, rows) }
      })
    })
  }, [userId])

  useEffect(() => { if (!useDB) storage.set(KEY, notes) }, [notes])

  const persist = useCallback(async (note) => {
    if (!useDB) return
    pendingWritesRef.current.set(note.id, note)
    try {
      await notesService.upsert(userId, note)
      pendingWritesRef.current.delete(note.id)
    } catch (err) {
      pendingWritesRef.current.delete(note.id)
      throw err
    }
  }, [useDB, userId])

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
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n
      const updated = { ...n, ...updates, updatedAt: new Date().toISOString() }
      persist(updated)
      return updated
    }))
  }

  // Restore a previously deleted note with its original id/content (undo)
  const restoreNote = (n) => {
    pendingDeletesRef.current.delete(n.id)
    setNotes(prev => [n, ...prev])
    persist(n)
  }

  const deleteNote = (id) => {
    pendingDeletesRef.current.add(id)
    setNotes(prev => prev.filter(n => n.id !== id))
    if (useDB) {
      notesService.delete(userId, id)
      setTimeout(() => pendingDeletesRef.current.delete(id), 3000)
    }
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
