// Hook: Notes/journal CRUD state management backed by localStorage
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'

const KEY = 'notes'

export function useNotes() {
  const [notes, setNotes] = useState(() => storage.get(KEY, []))

  useEffect(() => { storage.set(KEY, notes) }, [notes])

  const addNote = (partial = {}) => {
    const note = {
      id:        Date.now().toString(),
      title:     partial.title   || 'Untitled',
      content:   partial.content || '',
      pinned:    false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes(prev => [note, ...prev])
    return note
  }

  const updateNote = (id, updates) =>
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    ))

  const deleteNote = (id) =>
    setNotes(prev => prev.filter(n => n.id !== id))

  const togglePin = (id) =>
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))

  // Pinned first, then by most recently updated
  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  return { notes: sorted, addNote, updateNote, deleteNote, togglePin }
}
