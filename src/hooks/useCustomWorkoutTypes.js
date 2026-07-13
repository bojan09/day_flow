// Hook: useCustomWorkoutTypes
// Purpose: Store and manage user-defined workout types.
//          Merges with the built-in WORKOUT_TYPES — custom ones appear after defaults.
//          Persisted to Supabase via usePersistedState (KV table), mirrors useCustomCategories.
import { usePersistedState } from './usePersistedState'
import { WORKOUT_TYPES } from './useWorkouts'

export function useCustomWorkoutTypes() {
  const [custom, setCustom] = usePersistedState('custom_workout_types', [])

  // Full list — defaults first, then user additions
  const all = [
    ...WORKOUT_TYPES,
    ...custom.filter(t => !WORKOUT_TYPES.includes(t)),
  ]

  const addType = (name) => {
    const trimmed = name.trim()
    if (!trimmed || all.includes(trimmed)) return false
    setCustom(prev => [...prev, trimmed])
    return true
  }

  const removeType = (name) => {
    // Can only remove custom ones, not defaults
    if (WORKOUT_TYPES.includes(name)) return
    setCustom(prev => prev.filter(t => t !== name))
  }

  const isCustom = (name) => !WORKOUT_TYPES.includes(name)

  return { all, custom, addType, removeType, isCustom }
}
