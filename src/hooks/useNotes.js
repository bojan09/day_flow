// Hook: useNotes
// Purpose: Notes CRUD with tags, word count, Supabase sync, and real-time
import { useState, useEffect, useCallback, useRef } from 'react'
import { scopedStorage } from '../services/storage'
import { storageScope } from '../services/scopedStorage'
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
  const scope            = storageScope(userId, isSupabaseConfigured())
  const pendingDeletesRef = useRef(new Set())

  const [notes, setNotes]   = useState(() => scopedStorage.get(scope, KEY, []))
  const [synced, setSynced] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const loadedScopeRef = useRef(scope)

  useEffect(() => {
    let active = true
    setSynced(false)
    setSyncError(null)
    const fallback = scope === 'demo' ? scopedStorage.readLegacy(KEY, []) : []
    const cached = scopedStorage.get(scope, KEY, fallback)
    setNotes(cached)
    if (!useDB) { setSynced(true); return () => { active = false } }
    notesService.getAll(userId).then(result => {
      if (!active) return
      if (result.ok) {
        const rows = result.value.filter(n => !pendingDeletesRef.current.has(n.id))
        setNotes(rows)
        scopedStorage.set(scope, KEY, rows)
      } else setSyncError(result.error)
      setSynced(true)
    })
    return () => { active = false }
  }, [scope, useDB, userId])

  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('notes', userId, () => {
      notesService.getAll(userId).then(result => {
        if (!result.ok) { setSyncError(result.error); return }
        const rows = result.value.filter(n => !pendingDeletesRef.current.has(n.id))
        setNotes(rows)
        scopedStorage.set(scope, KEY, rows)
      })
    })
  }, [scope, useDB, userId])

  useEffect(() => {
    if (loadedScopeRef.current !== scope) {
      loadedScopeRef.current = scope
      return
    }
    scopedStorage.set(scope, KEY, notes)
  }, [notes, scope])

  const persist = useCallback(async (note) => {
    if (useDB) await notesService.upsert(userId, note)
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

  return { notes: sorted, synced, syncError, addNote, restoreNote, updateNote, deleteNote, togglePin, getWordCount, getReadTime }
}
