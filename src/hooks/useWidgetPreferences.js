// Hook: useWidgetPreferences
// Purpose: Stores each user's Today widget preferences — pinned to top, hidden,
//          and custom order. Persisted to Supabase via usePersistedState.
import { usePersistedState } from './usePersistedState'

// Master widget registry — single source of truth for all Today widgets
export const WIDGET_REGISTRY = [
  { id: 'mood',         title: "Today's Mood",  emoji: '😊', defaultOpen: true,  alwaysVisible: false },
  { id: 'tasks-today',  title: "Today's Tasks", emoji: '✅', defaultOpen: true,  alwaysVisible: false },
  { id: 'rhythm-today', title: 'Daily Rhythm',  emoji: '🔁', defaultOpen: true,  alwaysVisible: false },
  { id: 'energy',       title: 'Energy',        emoji: '⚡', defaultOpen: false, alwaysVisible: false },
  { id: 'focus-task',   title: 'Focus Task',    emoji: '🎯', defaultOpen: false, alwaysVisible: false },
  { id: 'quick-note',   title: 'Quick Note',    emoji: '📝', defaultOpen: false, alwaysVisible: false },
  { id: 'mini-habits',  title: 'Mini Habits',   emoji: '⚡', defaultOpen: false, alwaysVisible: false },
  { id: 'daily-summary', title: 'Daily Summary', emoji: '📊', defaultOpen: true,  alwaysVisible: false },

  // ── Module widgets — full-feature mini cards shown on Today ───────────────
  { id: 'module-projects',   title: 'Projects',   emoji: '🗂️', defaultOpen: true,  alwaysVisible: false, isModule: true },
  { id: 'module-goals',      title: 'Goals',      emoji: '🏆', defaultOpen: true,  alwaysVisible: false, isModule: true },
  { id: 'module-workouts',   title: 'Workouts',   emoji: '🏋️', defaultOpen: true,  alwaysVisible: false, isModule: true },
  { id: 'module-calendar',   title: 'Calendar',   emoji: '📅', defaultOpen: true,  alwaysVisible: false, isModule: true },
  { id: 'module-notes',      title: 'Notes',      emoji: '📝', defaultOpen: true,  alwaysVisible: false, isModule: true },
  { id: 'module-ideas',      title: 'Ideas',      emoji: '💡', defaultOpen: true,  alwaysVisible: false, isModule: true },
]

const DEFAULT_PREFS = {
  pinned:      [],    // widget ids floated to the very top
  hidden:      [],    // widget ids never shown
  customOrder: null,  // null = use adaptive default; array = user's custom order
}

export function useWidgetPreferences() {
  const [prefs, setPrefs] = usePersistedState('widget_preferences', DEFAULT_PREFS)

  // ── Pin / Unpin ────────────────────────────────────────────────────────────
  const togglePin = (id) =>
    setPrefs(p => ({
      ...p,
      pinned: p.pinned.includes(id)
        ? p.pinned.filter(x => x !== id)
        : [...p.pinned, id],
    }))

  const isPinned = (id) => prefs.pinned.includes(id)

  // ── Hide / Show ────────────────────────────────────────────────────────────
  const toggleHide = (id) =>
    setPrefs(p => ({
      ...p,
      hidden:  p.hidden.includes(id)
        ? p.hidden.filter(x => x !== id)
        : [...p.hidden, id],
      // Un-pin if hiding
      pinned: p.pinned.filter(x => x !== id),
    }))

  const isHidden = (id) => prefs.hidden.includes(id)

  // ── Custom order ───────────────────────────────────────────────────────────
  const setCustomOrder = (order) =>
    setPrefs(p => ({ ...p, customOrder: order }))

  const resetOrder = () =>
    setPrefs(p => ({ ...p, customOrder: null }))

  // ── Compute final ordered widget list ─────────────────────────────────────
  // Takes the adaptive default order (from time-of-day logic) and applies:
  // 1. Remove hidden widgets
  // 2. Apply custom order if set
  // 3. Float pinned widgets to the top
  const getOrderedWidgets = (adaptiveOrder) => {
    const base = prefs.customOrder ?? adaptiveOrder

    // Filter to only known widget ids, remove hidden
    const filtered = base
      .filter(id => WIDGET_REGISTRY.find(w => w.id === id))
      .filter(id => !prefs.hidden.includes(id))

    // Add any widgets not in base (new widgets added after user set custom order)
    const missing = WIDGET_REGISTRY
      .map(w => w.id)
      .filter(id => !filtered.includes(id) && !prefs.hidden.includes(id))

    const all = [...filtered, ...missing]

    // Float pinned to top
    const pinned   = all.filter(id => prefs.pinned.includes(id))
    const unpinned = all.filter(id => !prefs.pinned.includes(id))

    return [...pinned, ...unpinned]
  }

  return {
    prefs,
    togglePin,   isPinned,
    toggleHide,  isHidden,
    setCustomOrder, resetOrder,
    getOrderedWidgets,
  }
}
