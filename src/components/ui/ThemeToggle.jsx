// Component: ThemeToggle
// Purpose: Compact 3-way toggle (Light / Dark / Forest) for TopBar and SideNav.
//          Clicking cycles through themes. Long-press / hover shows all 3 options.
import { useState } from 'react'
import { THEMES } from '../../hooks/useTheme'

const ICONS = { light: '☀️', dark: '🌙', forest: '🌿' }

export default function ThemeToggle({ theme, onSetTheme, compact = false }) {
  const [open, setOpen] = useState(false)
  const current = THEMES.find(t => t.id === theme) || THEMES[0]

  if (compact) {
    // Single button that cycles through themes
    const nextIndex = (THEMES.findIndex(t => t.id === theme) + 1) % THEMES.length
    const next      = THEMES[nextIndex]
    return (
      <button
        onClick={() => onSetTheme(next.id)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all active:scale-90"
        style={{ color: 'var(--text-muted)' }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        title={`Switch to ${next.label} mode`}
        aria-label={`Theme: ${current.label}. Click for ${next.label}`}
      >
        {ICONS[theme]}
      </button>
    )
  }

  // Expanded — shows all 3 options as a pill switcher
  return (
    <div
      className="flex gap-0.5 rounded-xl p-1"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
      role="group"
      aria-label="Theme selector"
    >
      {THEMES.map(t => (
        <button
          key={t.id}
          onClick={() => onSetTheme(t.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={theme === t.id
            ? {
                backgroundColor: 'var(--surface)',
                boxShadow:       'var(--shadow-card)',
                color:           'var(--text)',
              }
            : {
                color: 'var(--text-faint)',
              }
          }
          aria-pressed={theme === t.id}
        >
          <span>{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  )
}
