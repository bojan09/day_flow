// Hook: useCustomCategories
// Purpose: Store and manage user-defined task categories.
//          Merges with the built-in defaults — custom ones appear after defaults.
//          Persisted to Supabase via usePersistedState (KV table).
import { usePersistedState } from './usePersistedState'

export const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Finance', 'Other']

export function useCustomCategories() {
  const [custom, setCustom] = usePersistedState('custom_categories', [])

  // Full list — defaults first, then user additions
  const all = [
    ...DEFAULT_CATEGORIES,
    ...custom.filter(c => !DEFAULT_CATEGORIES.includes(c)),
  ]

  const addCategory = (name) => {
    const trimmed = name.trim()
    if (!trimmed || all.includes(trimmed)) return false
    setCustom(prev => [...prev, trimmed])
    return true
  }

  const removeCategory = (name) => {
    // Can only remove custom ones, not defaults
    if (DEFAULT_CATEGORIES.includes(name)) return
    setCustom(prev => prev.filter(c => c !== name))
  }

  const isCustom = (name) => !DEFAULT_CATEGORIES.includes(name)

  return { all, custom, addCategory, removeCategory, isCustom }
}
