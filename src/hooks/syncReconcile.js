// Module: syncReconcile
// Purpose: The pure decision logic behind useSyncedCollection — kept out of the
//          hook so it can be tested directly. This is the code that decides
//          whether a freshly-fetched set of rows is allowed to replace local
//          state, and it is where the optimistic-update race bugs lived.

/**
 * Merge freshly-fetched rows with in-flight local writes and deletes.
 *
 * Supabase realtime echoes the client's OWN writes back, so a refetch
 * triggered by our own change can resolve before that write has committed.
 * Rows with a pending local write keep the local value; rows pending deletion
 * are dropped.
 *
 * @param {Array<{id: string}>} rows        rows as returned by the service
 * @param {Map<string, object>} pendingWrites  id -> local record being written
 * @param {Set<string>}         pendingDeletes ids being deleted locally
 */
export function reconcileRows(rows, pendingWrites, pendingDeletes) {
  const filtered = rows.filter(r => !pendingDeletes.has(r.id))
  if (pendingWrites.size === 0) return filtered
  const byId = new Map(filtered.map(r => [r.id, r]))
  for (const [id, local] of pendingWrites) byId.set(id, local)
  return [...byId.values()]
}

/**
 * Whether a fetch result should be ignored rather than applied.
 *
 * Every service's getAll() returns [] both for "genuinely empty" and for a
 * failed query (it logs the error and returns []). Applying that blindly would
 * clear the UI and the localStorage cache behind it on any transient network
 * blip, so an empty result never overwrites a non-empty local list.
 *
 * @param {Array} rows          rows returned by the service
 * @param {Array} currentItems  what's currently in local state
 */
export function shouldIgnoreFetch(rows, currentItems) {
  return rows.length === 0 && currentItems.length > 0
}
