// Hook: useTheme
// Purpose: Manages the app theme (light / dark / forest).
//          - Raw localStorage key matches the FOUC-prevention script in index.html
//          - Briefly adds .theme-transitioning to <html> so CSS transitions
//            only fire during a deliberate theme switch, not on tab changes
import { useState, useEffect } from 'react'

export const THEMES = [
  { id: 'light',  label: 'Light',  icon: '☀️' },
  { id: 'dark',   label: 'Dark',   icon: '🌙' },
  { id: 'forest', label: 'Forest', icon: '🌿' },
]

const STORAGE_KEY = 'dayflow_theme'
const DEFAULT     = 'light'
const VALID_IDS   = new Set(['light', 'dark', 'forest'])

function readTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return VALID_IDS.has(saved) ? saved : DEFAULT
  } catch {
    return DEFAULT
  }
}

function applyTheme(t) {
  const html = document.documentElement
  // Enable transitions for this switch only
  html.classList.add('theme-transitioning')
  html.setAttribute('data-theme', t)
  try { localStorage.setItem(STORAGE_KEY, t) } catch {}
  // Remove transition class after animation completes
  setTimeout(() => html.classList.remove('theme-transitioning'), 350)
}

export function useTheme() {
  const [theme, setThemeState] = useState(readTheme)

  // Apply theme on mount (silent — no transition class on initial load)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  const setTheme = (t) => {
    if (!VALID_IDS.has(t)) return
    setThemeState(t)
    applyTheme(t)
  }

  return { theme, setTheme }
}
