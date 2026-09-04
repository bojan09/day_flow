// Service: pendingShare
// Purpose: Hand a PWA share-target link from app start-up to the view that
//          actually owns bookmarks. DashboardPage used to instantiate the whole
//          useBookmarks hook purely so this one code path could write a
//          bookmark, which meant every session loaded and subscribed to the
//          bookmarks table even when nothing bookmark-related was ever opened.
import { storage } from './storage'

const KEY = 'pending_share'

export function stashPendingShare(share) {
  storage.set(KEY, share)
}

// Returns the pending share once and clears it, so a refresh can't re-add it.
export function consumePendingShare() {
  const share = storage.get(KEY, null)
  if (share) storage.remove(KEY)
  return share
}
