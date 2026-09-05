// Hook: useBookmarks
// Purpose: Reading list. Sync/realtime/guards live in useSyncedCollection.
import { bookmarksService } from '../services/supabaseDataService'
import { useSyncedCollection } from './useSyncedCollection'

export const BOOKMARK_TAGS = ['article', 'video', 'tool', 'inspiration', 'reference', 'course']

export function useBookmarks() {
  const {
    items: bookmarks, setItems: setBookmarks, synced, useDB, userId, persist, remove, unmarkDeleted,
  } = useSyncedCollection({ storageKey: 'bookmarks', table: 'bookmarks', service: bookmarksService })

  const addBookmark = (data) => {
    const b = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, url: data.url?.trim() || '', title: data.title?.trim() || data.url || 'Untitled',
      note: data.note || '', tags: data.tags || [], read: false, remindAt: data.remindAt || null,
      createdAt: new Date().toISOString(), ...(useDB ? { user_id: userId } : {}),
    }
    setBookmarks(prev => [b, ...prev]); persist(b); return b
  }

  const updateBookmark = (id, updates) => {
    const current = bookmarks.find(b => b.id === id)
    if (!current) return
    const u = { ...current, ...updates }
    setBookmarks(prev => prev.map(b => (b.id === id ? u : b)))
    persist(u)
  }
  // Restore a previously deleted bookmark with its original id (undo)
  const restoreBookmark = (b) => { unmarkDeleted(b.id); setBookmarks(prev => [b, ...prev]); persist(b) }

  const deleteBookmark = (id)           => { setBookmarks(prev => prev.filter(b => b.id !== id)); remove(id) }
  const toggleRead     = (id)           => updateBookmark(id, { read: !bookmarks.find(b => b.id === id)?.read })
  const unread                          = bookmarks.filter(b => !b.read)

  return { bookmarks, synced, addBookmark, restoreBookmark, updateBookmark, deleteBookmark, toggleRead, unread }
}
