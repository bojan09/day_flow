// Hook: useNavConfig
// Purpose: Stores user's mobile bottom nav configuration in Supabase.
//          Default 4 tabs. User can replace any slot with any module.
import { usePersistedState } from './usePersistedState'

export const ALL_MODULES = [
  { id: 'today',      label: 'Today',     emoji: '☀️' },
  { id: 'tasks',      label: 'Tasks',     emoji: '✅' },
  { id: 'habits',     label: 'Habits',    emoji: '🔁' },
  { id: 'focus',      label: 'Focus',     emoji: '⏱️' },
  { id: 'workouts',   label: 'Workouts',  emoji: '🏋️' },
  { id: 'goals',      label: 'Goals',     emoji: '🏆' },
  { id: 'capture',    label: 'Capture',   emoji: '📥' },
  { id: 'calendar',   label: 'Calendar',  emoji: '📅' },
  { id: 'insights',   label: 'Insights',  emoji: '📊' },
  { id: 'routines',   label: 'Routines',  emoji: '🌅' },
  { id: 'projects',   label: 'Projects',  emoji: '🗂️' },
]

const DEFAULT_NAV = ['today', 'tasks', 'habits', 'focus']

export function useNavConfig() {
  const [navItems, setNavItems] = usePersistedState('mobile_nav_config', DEFAULT_NAV)

  const setSlot = (slotIdx, moduleId) =>
    setNavItems(prev => prev.map((id, i) => i === slotIdx ? moduleId : id))

  const resetToDefault = () => setNavItems(DEFAULT_NAV)

  const getModule = (id) => ALL_MODULES.find(m => m.id === id) ?? ALL_MODULES[0]

  return { navItems, setSlot, resetToDefault, getModule }
}
