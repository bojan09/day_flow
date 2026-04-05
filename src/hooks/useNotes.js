// Hook: useNotes
// Purpose: Notes/journal CRUD with tags, word count, localStorage persistence
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'

const KEY = 'notes'

export const NOTE_TAGS = ['journal', 'idea', 'work', 'reflection', 'personal', 'learning']

export function useNotes() {
  const [notes, setNotes] = useState(() => storage.get(KEY, []))

  useEffect(() => { storage.set(KEY, notes) }, [notes])

  const addNote = (partial = {}) => {
    const note = {
      id:        Date.now().toString(),
      title:     partial.title   || 'Untitled',
      content:   partial.content || '',
      tags:      partial.tags    || [],
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

  const deleteNote  = (id)  => setNotes(prev => prev.filter(n => n.id !== id))
  const togglePin   = (id)  => setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))

  const getWordCount  = (content = '') => content.trim().split(/\s+/).filter(Boolean).length
  const getReadTime   = (content = '') => Math.max(1, Math.round(getWordCount(content) / 200))

  const filterByTag   = (tag) => notes.filter(n => n.tags.includes(tag))

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned - a.pinned
    return new Date(b.updatedAt) - new Date(a.updatedAt)
  })

  return { notes: sorted, addNote, updateNote, deleteNote, togglePin, getWordCount, getReadTime, filterByTag }
}
