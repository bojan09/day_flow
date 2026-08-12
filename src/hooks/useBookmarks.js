// Hook: useBookmarks
// Purpose: Reading list with Supabase sync + real-time
import { useState, useEffect, useCallback, useRef } from 'react'
import { scopedStorage } from '../services/storage'
import { storageScope } from '../services/scopedStorage'
import { bookmarksService } from '../services/supabaseDataService'
import { subscribeToTable } from '../services/realtimeService'
import { useAuth } from './useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'

const KEY = 'bookmarks'
export const BOOKMARK_TAGS = ['article', 'video', 'tool', 'inspiration', 'reference', 'course']

export function useBookmarks() {
  const { user }  = useAuth()
  const userId    = user?.id
  const useDB            = isSupabaseConfigured() && !!userId
  const scope            = storageScope(userId, isSupabaseConfigured())
  const [synced, setSynced] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const loadedScopeRef = useRef(scope)

  const [bookmarks, setBookmarks] = useState(() => scopedStorage.get(scope, KEY, []))

  useEffect(() => {
    let active = true
    setSynced(false); setSyncError(null)
    const fallback = scope === 'demo' ? scopedStorage.readLegacy(KEY, []) : []
    setBookmarks(scopedStorage.get(scope, KEY, fallback))
    if (!useDB) { setSynced(true); return () => { active = false } }
    bookmarksService.getAll(userId).then(result => {
      if (!active) return
      if (result.ok) { setBookmarks(result.value); scopedStorage.set(scope, KEY, result.value) }
      else setSyncError(result.error)
      setSynced(true)
    })
    return () => { active = false }
  }, [scope, useDB, userId])

  useEffect(() => {
    if (!useDB) return
    return subscribeToTable('bookmarks', userId, () =>
      bookmarksService.getAll(userId).then(result => {
        if (result.ok) { setBookmarks(result.value); scopedStorage.set(scope, KEY, result.value) }
        else setSyncError(result.error)
      })
    )
  }, [scope, useDB, userId])

  useEffect(() => {
    if (loadedScopeRef.current !== scope) { loadedScopeRef.current = scope; return }
    scopedStorage.set(scope, KEY, bookmarks)
  }, [bookmarks, scope])

  const persist = useCallback(async (b) => { if (useDB) await bookmarksService.upsert(userId, b) }, [useDB, userId])

  const addBookmark = (data) => {
    const b = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,9)}`, url: data.url?.trim() || '', title: data.title?.trim() || data.url || 'Untitled',
      note: data.note || '', tags: data.tags || [], read: false, remindAt: data.remindAt || null,
      createdAt: new Date().toISOString(), ...(useDB ? { user_id: userId } : {}),
    }
    setBookmarks(prev => [b, ...prev]); persist(b); return b
  }

  const updateBookmark = (id, updates) => setBookmarks(prev => prev.map(b => { if (b.id !== id) return b; const u = { ...b, ...updates }; persist(u); return u }))
  // Restore a previously deleted bookmark with its original id (undo)
  const restoreBookmark = (b) => { setBookmarks(prev => [b, ...prev]); persist(b) }

  const deleteBookmark = (id)           => { setBookmarks(prev => prev.filter(b => b.id !== id)); if (useDB) bookmarksService.delete(userId, id) }
  const toggleRead     = (id)           => updateBookmark(id, { read: !bookmarks.find(b => b.id === id)?.read })
  const unread                          = bookmarks.filter(b => !b.read)

  return { bookmarks, synced, syncError, addBookmark, restoreBookmark, updateBookmark, deleteBookmark, toggleRead, unread }
}
