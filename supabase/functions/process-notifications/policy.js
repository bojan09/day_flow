export function isQuietTime(localTime, start, end) {
  if (start === end) return false
  return start < end
    ? localTime >= start && localTime < end
    : localTime >= start || localTime < end
}

export function dailySendAllowed({ sentToday = 0, sentLastHour = 0, explicit = false }) {
  return explicit || (sentToday < 3 && sentLastHour < 1)
}

export function buildNotificationCandidates({ preferences, tasks = [], now = new Date() }) {
  if (!preferences?.enabled) return []

  return tasks
    .filter(task => (
      !task.completed &&
      task.reminder_at &&
      new Date(task.reminder_at) <= now &&
      !task.reminder_sent
    ))
    .map(task => ({
      category: 'task_reminder',
      sourceType: 'task',
      sourceId: task.id,
      logicalKey: `task:${task.id}:${task.reminder_at}`,
      title: 'Task reminder',
      body: task.title,
      url: `/tasks/${encodeURIComponent(task.id)}`,
      explicit: true,
    }))
}

export function toDeliveryRow(userId, candidate) {
  return {
    user_id: userId,
    logical_key: candidate.logicalKey,
    category: candidate.category,
    source_type: candidate.sourceType,
    source_id: candidate.sourceId,
    bucket: candidate.logicalKey.split(':').at(-1),
    title: candidate.title,
    body: candidate.body,
    url: candidate.url,
  }
}

export function buildOneSignalPayload({ userId, title, body, url, idempotencyKey, appId }) {
  return {
    app_id: appId,
    include_aliases: { external_id: [userId] },
    target_channel: 'push',
    headings: { en: title },
    contents: { en: body },
    url,
    idempotency_key: idempotencyKey,
  }
}
