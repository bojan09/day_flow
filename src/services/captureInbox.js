export function normalizeInboxItem(item, now = new Date().toISOString()) {
  return {
    id: item.id,
    text: String(item.text ?? '').trim(),
    inferredType: item.inferredType ?? item.inferred_type ?? 'inbox',
    fields: item.fields ?? {},
    status: item.status ?? 'open',
    convertedType: item.convertedType ?? item.converted_type ?? null,
    convertedId: item.convertedId ?? item.converted_id ?? null,
    createdAt: item.createdAt ?? item.created_at ?? now,
    updatedAt: item.updatedAt ?? item.updated_at ?? now,
  }
}

export const visibleInboxItems = items => (items ?? []).map(item => normalizeInboxItem(item)).filter(item => item.status === 'open')
export const canConvert = item => normalizeInboxItem(item).status === 'open' && !normalizeInboxItem(item).convertedId

export function markConverted(item, convertedType, convertedId, now = new Date().toISOString()) {
  const normalized = normalizeInboxItem(item)
  if (!canConvert(normalized)) throw new Error('Inbox item is already converted')
  if (!convertedId) throw new Error('Converted target ID is required')
  return { ...normalized, status: 'converted', convertedType, convertedId: String(convertedId), updatedAt: now }
}
