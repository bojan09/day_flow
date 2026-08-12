export function operationKey(type, entityId) {
  return `${type}:${entityId}`
}

export async function replayOperations(queue, activeOwnerId, handlers) {
  const completed = []
  const remaining = []
  const foreign = []
  const errors = []

  for (const operation of queue) {
    if (operation.ownerId !== activeOwnerId) {
      foreign.push(operation)
      remaining.push(operation)
      continue
    }

    const handler = handlers[operation.type]
    if (!handler) {
      const error = new Error(`Unknown operation type: ${operation.type}`)
      errors.push(error)
      remaining.push({ ...operation, attempts: (operation.attempts ?? 0) + 1 })
      continue
    }

    try {
      await handler(operation)
      completed.push(operation)
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause))
      errors.push(error)
      remaining.push({ ...operation, attempts: (operation.attempts ?? 0) + 1 })
    }
  }

  return { completed, remaining, foreign, errors }
}

export function createOperation({ ownerId, type, entityId, payload, now = Date.now, id = crypto.randomUUID }) {
  if (!ownerId || !type || !entityId) throw new Error('Offline operations require owner, type, and entity ID')
  return {
    id: id(),
    ownerId,
    type,
    entityId,
    payload,
    queuedAt: now(),
    attempts: 0,
  }
}
