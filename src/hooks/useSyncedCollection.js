// Hook: useSyncedCollection
// Purpose: Shared engine behind every Supabase-synced list hook (useTasks,
//          useGoals, useNotes, useIdeas, useProjects, useBookmarks). Owns the
//          optimistic write/delete guards, realtime reconciliation, and the
//          localStorage fallback so those behaviours live in exactly ONE place
//          instead of being hand-copied into seven files that drift apart.
import { useState, useEffect, useCallback, useRef } from 'react'
import { storage }               from '../services/storage'
import { subscribeToTable }      from '../services/realtimeService'
import { useAuth }               from './useAuth'
import { isSupabaseConfigured }  from '../services/supabaseClient'
import { withRetry }             from '../utils/withRetry'
import { useToast }              from '../utils/toast'
import { reconcileRows, shouldIgnoreFetch } from './syncReconcile'

// How long a write/delete guard is held after the operation commits. A
// getAll() that was already in flight when the write started reflects DB state
// as of when IT queried, not when it resolves — so clearing the guard the
// instant the write succeeds still loses the race against that older fetch.
const GUARD_MS = 3000

export function useSyncedCollection({ storageKey, table, service }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const userId   = user?.id
  const useDB    = isSupabaseConfigured() && !!userId

  const [items,  setItems]  = useState(() => storage.get(storageKey, []))
  const [synced, setSynced] = useState(false)

  // In-flight local writes keyed by record id, and ids we've locally deleted.
  // Both exist because Supabase realtime echoes the client's OWN writes back:
  // without these guards a refetch triggered by our own change can resolve
  // before the write commits and silently revert the optimistic update.
  const pendingWritesRef  = useRef(new Map())
  const pendingDeletesRef = useRef(new Set())

  // Live mirror of `items` so the realtime handler can tell a genuine empty
  // result from a failed fetch without re-subscribing on every state change.
  const itemsRef = useRef(items)
  useEffect(() => { itemsRef.current = items }, [items])

  const applyRows = useCallback((rows) => {
    if (shouldIgnoreFetch(rows, itemsRef.current)) return
    const merged = reconcileRows(rows, pendingWritesRef.current, pendingDeletesRef.current)
    setItems(merged)
    storage.set(storageKey, merged)
  }, [storageKey])

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    // FIX: several hooks used to bail here without setting synced, leaving
    // demo mode (signed out / no Supabase keys) pinned on <ViewSkeleton> forever.
    if (!useDB) { setSynced(true); return }
    let cancelled = false
    service.getAll(userId).then(rows => {
      if (cancelled) return
      applyRows(rows)
      setSynced(true)
    })
    return () => { cancelled = true }
  }, [userId, useDB, service, applyRows])

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!useDB) return
    return subscribeToTable(table, userId, () => {
      service.getAll(userId).then(applyRows)
    })
  }, [userId, useDB, service, table, applyRows])

  // ── localStorage-only persistence (demo mode) ─────────────────────────────
  useEffect(() => { if (!useDB) storage.set(storageKey, items) }, [items, useDB, storageKey])

  // Retries with backoff, and on final failure tells the user rather than
  // leaving an optimistic update sitting there looking saved. `onFail` lets a
  // caller roll its own state back (see useTasks.toggleTask).
  const persist = useCallback(async (item, { onFail } = {}) => {
    if (!useDB) return
    pendingWritesRef.current.set(item.id, item)
    let failed = false
    await withRetry(() => service.upsert(userId, item), {
      errorMessage: 'Save failed — check your connection',
      onFail: (message, err) => {
        failed = true
        // Write never landed: drop the guard so a fresh fetch wins.
        pendingWritesRef.current.delete(item.id)
        toast.error(message)
        onFail?.(message, err)
      },
    })
    if (!failed) setTimeout(() => pendingWritesRef.current.delete(item.id), GUARD_MS)
  }, [useDB, userId, service, toast])

  const remove = useCallback(async (id, { onFail } = {}) => {
    if (!useDB) return
    // Guard BEFORE the await so realtime can't restore the row mid-delete.
    pendingDeletesRef.current.add(id)
    await withRetry(() => service.delete(userId, id), {
      errorMessage: 'Delete failed — check your connection',
      onFail: (message, err) => {
        // Stop suppressing the row: it still exists server-side, so let the
        // next fetch bring it back rather than hiding it from the user.
        pendingDeletesRef.current.delete(id)
        toast.error(message)
        onFail?.(message, err)
      },
    })
    setTimeout(() => pendingDeletesRef.current.delete(id), GUARD_MS)
  }, [useDB, userId, service, toast])

  // Undo support: drop the delete guard so a restored record isn't filtered out.
  const unmarkDeleted = useCallback((id) => { pendingDeletesRef.current.delete(id) }, [])

  return { items, setItems, synced, useDB, userId, persist, remove, unmarkDeleted }
}
