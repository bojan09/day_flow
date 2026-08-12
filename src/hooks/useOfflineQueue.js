// Hook: reload-safe, owner-scoped offline write replay.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { scopedStorage } from '../services/storage'
import { createOperation, operationKey, replayOperations } from '../services/offlineOperations'
import { kvService } from '../services/supabaseDataService'

const QUEUE_KEY = 'offline_write_queue'

export function useOfflineQueue(activeOwnerId = 'demo') {
  const ownerId = activeOwnerId || 'demo'
  const scope = ownerId === 'demo' ? 'demo' : `user:${ownerId}`
  const [isOnline, setIsOnline] = useState(() => globalThis.navigator?.onLine ?? true)
  const [queue, setQueue] = useState(() => scopedStorage.get(scope, QUEUE_KEY, []))
  const [replaying, setReplaying] = useState(false)
  const [lastError, setLastError] = useState(null)
  const loadedScopeRef = useRef(scope)
  const loadedOwnerRef = useRef(ownerId)
  const customHandlersRef = useRef({})

  const handlers = useMemo(() => ({
    'kv:set': operation => {
      const { userId, key, value } = operation.payload
      if (userId !== operation.ownerId) throw new Error('Offline KV owner mismatch')
      return kvService.set(userId, key, value)
    },
    ...customHandlersRef.current,
  }), [ownerId])

  useEffect(() => {
    if (loadedOwnerRef.current !== ownerId) {
      customHandlersRef.current = {}
      loadedOwnerRef.current = ownerId
    }
    setQueue(scopedStorage.get(scope, QUEUE_KEY, []))
    setLastError(null)
  }, [ownerId, scope])

  useEffect(() => {
    if (loadedScopeRef.current !== scope) { loadedScopeRef.current = scope; return }
    scopedStorage.set(scope, QUEUE_KEY, queue)
  }, [queue, scope])

  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const replay = useCallback(async () => {
    if (!isOnline || replaying || queue.length === 0) return
    setReplaying(true)
    try {
      const result = await replayOperations(queue, ownerId, handlers)
      setQueue(result.remaining)
      setLastError(result.errors.at(-1) ?? null)
      return result
    } finally {
      setReplaying(false)
    }
  }, [handlers, isOnline, ownerId, queue, replaying])

  useEffect(() => {
    if (!isOnline || queue.length === 0 || replaying) return
    const timeout = setTimeout(() => { replay() }, 1200)
    return () => clearTimeout(timeout)
  }, [isOnline, queue.length, replay, replaying])

  const register = useCallback((type, handler) => {
    customHandlersRef.current[type] = handler
    return () => { delete customHandlersRef.current[type] }
  }, [])

  const enqueue = useCallback((type, entityId, payload) => {
    const operation = createOperation({ ownerId, type, entityId, payload })
    setQueue(previous => [
      ...previous.filter(item => operationKey(item.type, item.entityId) !== operationKey(type, entityId)),
      operation,
    ])
    return operation
  }, [ownerId])

  const safeWrite = useCallback(async (legacyKey, payload, writeFn) => {
    const entityId = legacyKey.startsWith('kv:') ? legacyKey.slice(3) : legacyKey
    const type = legacyKey.startsWith('kv:') ? 'kv:set' : legacyKey
    if (!isOnline) return enqueue(type, entityId, payload)
    try {
      await writeFn(payload)
      return null
    } catch (error) {
      setLastError(error instanceof Error ? error : new Error(String(error)))
      return enqueue(type, entityId, payload)
    }
  }, [enqueue, isOnline])

  const clearOwner = useCallback(owner => {
    if (owner !== ownerId) return
    setQueue([])
    scopedStorage.remove(scope, QUEUE_KEY)
  }, [ownerId, scope])

  return {
    isOnline,
    queue,
    queueLength: queue.length,
    replaying,
    lastError,
    register,
    enqueue,
    replay,
    safeWrite,
    clearOwner,
  }
}

export const OfflineQueueContext = createContext(null)
export const useOfflineQueueContext = () => useContext(OfflineQueueContext)
