// Hook: useTheme
// Purpose: Manage light/dark theme preference, persisted to localStorage
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'

export const THEMES = [
  { id: 'light',  label: 'Light',  icon: '☀️' },
  { id: 'dark',   label: 'Dark',   icon: '🌙' },
  { id: 'forest', label: 'Forest', icon: '🌿' },
]

export function useTheme() {
  const [theme, setThemeState] = useState(() => storage.get('theme', 'light'))

  useEffect(() => {
    storage.set('theme', theme)
    // Apply data-theme attribute for CSS variable switching
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = (t) => setThemeState(t)

  return { theme, setTheme }
}
