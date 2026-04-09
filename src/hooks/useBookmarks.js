// Hook: useBookmarks
// Purpose: Save URLs with title, notes, tags, read status, and scheduled reminders
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'

const KEY = 'bookmarks'

export const BOOKMARK_TAGS = ['article', 'video', 'tool', 'inspiration', 'reference', 'course']

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => storage.get(KEY, []))
  useEffect(() => { storage.set(KEY, bookmarks) }, [bookmarks])

  const addBookmark = (data) => {
    const b = {
      id:        Date.now().toString(),
      url:       data.url?.trim()   || '',
      title:     data.title?.trim() || data.url || 'Untitled',
      note:      data.note          || '',
      tags:      data.tags          || [],
      read:      false,
      remindAt:  data.remindAt      || null,
      createdAt: new Date().toISOString(),
    }
    setBookmarks(prev => [b, ...prev])
    return b
  }

  const updateBookmark = (id, updates) =>
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))

  const deleteBookmark = (id)    => setBookmarks(prev => prev.filter(b => b.id !== id))
  const toggleRead     = (id)    => setBookmarks(prev => prev.map(b => b.id === id ? { ...b, read: !b.read } : b))

  const filterByTag    = (tag)   => bookmarks.filter(b => b.tags.includes(tag))
  const unread         = bookmarks.filter(b => !b.read)

  return { bookmarks, addBookmark, updateBookmark, deleteBookmark, toggleRead, filterByTag, unread }
}
