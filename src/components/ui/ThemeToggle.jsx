// Component: ThemeToggle
// Purpose: 3-way theme switcher for TopBar (compact cycle) and SideNav (expanded pills).
//          Active state uses accent colours so it's visible on every theme.
import { THEMES } from '../../hooks/useTheme'

const ICONS = { light: '☀️', dark: '🌙', forest: '🌿' }

export default function ThemeToggle({ theme, onSetTheme, compact = false }) {
  const current    = THEMES.find(t => t.id === theme) || THEMES[0]
  const nextIndex  = (THEMES.findIndex(t => t.id === theme) + 1) % THEMES.length
  const next       = THEMES[nextIndex]

  // ── Compact: single button that cycles L → D → F ──────────────────────────
  if (compact) {
    return (
      <button
        onClick={() => onSetTheme(next.id)}
        className="hover-surface w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all active:scale-90"
        style={{ color: 'var(--text-muted)' }}
        title={`Theme: ${current.label} — click for ${next.label}`}
        aria-label={`Theme: ${current.label}. Click for ${next.label}`}
      >
        {ICONS[theme]}
      </button>
    )
  }

  // ── Expanded: pill switcher with all 3 options ─────────────────────────────
  // Active state uses accent-light bg + accent text so it's always visible,
  // even when the container and surface share the same background colour.
  return (
    <div
      className="flex rounded-xl overflow-hidden border"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
      role="group"
      aria-label="Theme selector"
    >
      {THEMES.map(t => {
        const active = theme === t.id
        return (
          <button
            key={t.id}
            onClick={() => onSetTheme(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all"
            style={active
              ? {
                  backgroundColor: 'var(--accent-light)',
                  color:           'var(--accent)',
                  borderBottom:    '2px solid var(--accent)',
                }
              : {
                  backgroundColor: 'transparent',
                  color:           'var(--text-faint)',
                  borderBottom:    '2px solid transparent',
                }
            }
            aria-pressed={active}
            title={t.label}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
