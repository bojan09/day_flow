// Hook: useOfflineQueue
// Purpose: Queues Supabase write operations that fail when offline.
//          Automatically replays the queue when the device comes back online.
//          The app always writes to localStorage first — this ensures zero data loss.
import { useState, useEffect, useRef, useCallback } from 'react'
import { storage } from '../services/storage'

const QUEUE_KEY = 'offline_write_queue'

export function useOfflineQueue() {
  const [isOnline, setIsOnline]   = useState(() => navigator.onLine)
  const [queue,    setQueue]      = useState(() => storage.get(QUEUE_KEY, []))
  const [replaying, setReplaying] = useState(false)
  const replayRef = useRef(null)

  // Persist queue to localStorage whenever it changes
  useEffect(() => { storage.set(QUEUE_KEY, queue) }, [queue])

  // Listen for online / offline events
  useEffect(() => {
    const goOnline  = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Replay queue when coming back online
  useEffect(() => {
    if (!isOnline || queue.length === 0 || replaying) return

    const replay = async () => {
      setReplaying(true)
      const remaining = []

      for (const op of queue) {
        try {
          // Re-hydrate the operation function from its serialised form
          const fn = replayRef.current?.[op.key]
          if (fn) {
            await fn(op.payload)
          }
        } catch {
          // If it still fails, keep in queue for next retry
          remaining.push(op)
        }
      }

      setQueue(remaining)
      setReplaying(false)
    }

    // Small delay to let connection stabilise
    const t = setTimeout(replay, 1200)
    return () => clearTimeout(t)
  // Keyed on queue length rather than the array so replaying (which mutates
  // the queue) does not immediately retrigger itself.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, queue.length])

  // Register a replay handler for a specific operation key
  const register = useCallback((key, fn) => {
    if (!replayRef.current) replayRef.current = {}
    replayRef.current[key] = fn
  }, [])

  // Enqueue a failed write for later replay
  const enqueue = useCallback((key, payload) => {
    setQueue(prev => {
      // Deduplicate by key + id so we don't queue the same record twice
      const filtered = prev.filter(op => !(op.key === key && op.payload?.id === payload?.id))
      return [...filtered, { key, payload, queuedAt: Date.now() }]
    })
  }, [])

  // Execute a Supabase write — falls back to queue on failure
  const safeWrite = useCallback(async (key, payload, writeFn) => {
    if (!isOnline) { enqueue(key, payload); return }
    try {
      await writeFn(payload)
    } catch {
      enqueue(key, payload)
    }
  }, [isOnline, enqueue])

  const clearQueue = () => setQueue([])

  return {
    isOnline,
    queue,
    queueLength: queue.length,
    replaying,
    register,
    enqueue,
    safeWrite,
    clearQueue,
  }
}

// Singleton pattern — one queue shared across the app via Context
import { createContext, useContext } from 'react'
export const OfflineQueueContext = createContext(null)
export const useOfflineQueueContext = () => useContext(OfflineQueueContext)
