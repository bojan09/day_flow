// Hook: useNavConfig
// Purpose: Stores user's mobile bottom nav configuration in Supabase.
//          Default 4 tabs. User can replace any slot with any module.
import { usePersistedState } from './usePersistedState'
import { ALL_MODULES } from '../config/navigation'

export { ALL_MODULES }

// Old persisted nav configs may still reference the standalone 'habits' /
// 'routines' ids that were folded into 'rhythm' — map them so existing
// users' saved bottom-nav slots keep showing a valid module/label instead of
// silently falling back to the first module.
const LEGACY_MODULE_IDS = { habits: 'rhythm', routines: 'rhythm' }

const DEFAULT_NAV = ['today', 'tasks', 'rhythm', 'fasting', 'focus']

export function useNavConfig() {
  const [navItems, setNavItems] = usePersistedState('mobile_nav_config', DEFAULT_NAV)

  const setSlot = (slotIdx, moduleId) =>
    setNavItems(prev => prev.map((id, i) => i === slotIdx ? moduleId : id))

  const resetToDefault = () => setNavItems(DEFAULT_NAV)

  const getModule = (id) =>
    ALL_MODULES.find(m => m.id === (LEGACY_MODULE_IDS[id] ?? id)) ?? ALL_MODULES[0]

  return { navItems, setSlot, resetToDefault, getModule }
}
