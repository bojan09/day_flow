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

// How long a write/delete guard is held after the operation commits. A
// getAll() that was already in flight when the write started reflects DB state
// as of when IT queried, not when it resolves — so clearing the guard the
// instant the write succeeds still loses the race against that older fetch.
const GUARD_MS = 3000

export function useSyncedCollection({ storageKey, table, service }) {
  const { user } = useAuth()
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

  const reconcile = useCallback((rows) => {
    const filtered = rows.filter(r => !pendingDeletesRef.current.has(r.id))
    if (pendingWritesRef.current.size === 0) return filtered
    const byId = new Map(filtered.map(r => [r.id, r]))
    for (const [id, local] of pendingWritesRef.current) byId.set(id, local)
    return [...byId.values()]
  }, [])

  const applyRows = useCallback((rows) => {
    // Every service's getAll() returns [] BOTH for "genuinely empty" and for a
    // failed query (it logs the error and returns []). Never let that wipe a
    // non-empty local list — a transient network blip would otherwise clear the
    // UI and the localStorage cache sitting behind it.
    if (rows.length === 0 && itemsRef.current.length > 0) return
    const merged = reconcile(rows)
    setItems(merged)
    storage.set(storageKey, merged)
  }, [reconcile, storageKey])

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
  }, [userId, useDB])

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!useDB) return
    return subscribeToTable(table, userId, () => {
      service.getAll(userId).then(applyRows)
    })
  }, [userId, useDB])

  // ── localStorage-only persistence (demo mode) ─────────────────────────────
  useEffect(() => { if (!useDB) storage.set(storageKey, items) }, [items, useDB, storageKey])

  const persist = useCallback(async (item) => {
    if (!useDB) return
    pendingWritesRef.current.set(item.id, item)
    try {
      await service.upsert(userId, item)
      setTimeout(() => pendingWritesRef.current.delete(item.id), GUARD_MS)
    } catch (err) {
      // Write never landed — nothing to protect, and a fresh fetch should win.
      pendingWritesRef.current.delete(item.id)
      throw err
    }
  }, [useDB, userId, service])

  const remove = useCallback(async (id) => {
    if (!useDB) return
    // Guard BEFORE the await so realtime can't restore the row mid-delete.
    pendingDeletesRef.current.add(id)
    try {
      await service.delete(userId, id)
    } finally {
      setTimeout(() => pendingDeletesRef.current.delete(id), GUARD_MS)
    }
  }, [useDB, userId, service])

  // Undo support: drop the delete guard so a restored record isn't filtered out.
  const unmarkDeleted = useCallback((id) => { pendingDeletesRef.current.delete(id) }, [])

  return { items, setItems, synced, useDB, userId, persist, remove, unmarkDeleted }
}
