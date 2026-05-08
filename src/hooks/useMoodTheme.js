// Hook: useMoodTheme
// Purpose: Subtly tints the app's accent and surface colours based on today's mood.
//          Score 5 (Great) → warmer greens. Score 1 (Rough) → cooler muted tones.
//          Changes are gentle — never jarring. User can disable in settings.
//          Stored in usePersistedState so the preference persists.
import { useEffect } from 'react'
import { usePersistedState } from './usePersistedState'

// Mood tint palettes — each overrides a few CSS variables subtly
const MOOD_TINTS = {
  5: { // Great — warm energised green
    '--accent':       '#2D7A4F',
    '--accent-light': '#E8F5EE',
    '--accent-mid':   '#A8D5BB',
    '--bg':           '#F8FAF8',
  },
  4: { // Good — standard theme (no change)
    '--accent':       null,
    '--accent-light': null,
    '--accent-mid':   null,
    '--bg':           null,
  },
  3: { // Okay — slightly warmer amber tint
    '--accent':       '#7C6A3A',
    '--accent-light': '#FBF5E8',
    '--accent-mid':   '#E8D5A0',
    '--bg':           '#FAFAF6',
  },
  2: { // Low — muted blue-grey
    '--accent':       '#4A6580',
    '--accent-light': '#EAF0F6',
    '--accent-mid':   '#B8CDD8',
    '--bg':           '#F8F9FA',
  },
  1: { // Rough — very muted, desaturated
    '--accent':       '#6B6B70',
    '--accent-light': '#F2F2F4',
    '--accent-mid':   '#C8C8CC',
    '--bg':           '#F9F9F9',
  },
}

export function useMoodTheme(mood, currentTheme) {
  const [enabled, setEnabled] = usePersistedState('mood_responsive_ui', true)

  useEffect(() => {
    const html = document.documentElement

    // Only apply in light theme — dark/forest have their own palettes
    if (!enabled || currentTheme !== 'light') {
      // Clear any previously applied tints
      Object.keys(MOOD_TINTS[4]).forEach(key => html.style.removeProperty(key))
      return
    }

    const todayMood = mood.getTodayMood()
    if (!todayMood) {
      Object.keys(MOOD_TINTS[4]).forEach(key => html.style.removeProperty(key))
      return
    }

    const tints = MOOD_TINTS[todayMood.score]
    if (!tints) return

    Object.entries(tints).forEach(([key, value]) => {
      if (value) html.style.setProperty(key, value)
      else       html.style.removeProperty(key)
    })

    return () => {
      Object.keys(MOOD_TINTS[4]).forEach(key => html.style.removeProperty(key))
    }
  }, [mood, currentTheme, enabled])

  return { enabled, setEnabled }
}
