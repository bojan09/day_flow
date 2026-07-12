// Component: ThemePicker
// Purpose: Polished theme switcher with live preview swatches and smooth transitions
import { THEMES } from '../../hooks/useTheme'

const PREVIEWS = {
  light:  { bg: '#FAFAF8', surface: '#FFFFFF', accent: '#3B6B4B', text: '#1A1A1A' },
  dark:   { bg: '#111210', surface: '#1C1E1B', accent: '#5A9E6F', text: '#EDEAE4' },
  forest: { bg: '#EFF5EE', surface: '#F8FCF7', accent: '#2A5A3A', text: '#1A2A1A' },
}

export default function ThemePicker({ theme, onSetTheme }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
        Appearance
      </p>
      <div className="flex gap-3">
        {THEMES.map(t => {
          const p       = PREVIEWS[t.id]
          const active  = theme === t.id
          return (
            <button
              key={t.id}
              onClick={() => onSetTheme(t.id)}
              className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all duration-200 ${
                active ? 'scale-105 shadow-md' : 'hover:scale-102 opacity-80 hover:opacity-100'
              }`}
              style={{
                borderColor: active ? 'var(--accent)' : 'var(--border)',
                backgroundColor: active ? 'var(--accent-light)' : 'var(--bg-secondary)',
              }}
            >
              {/* Mini preview */}
              <div className="w-10 h-7 rounded-lg overflow-hidden border" style={{ borderColor: p.text + '22' }}>
                <div className="w-full h-full relative" style={{ backgroundColor: p.bg }}>
                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-md" style={{ backgroundColor: p.surface }} />
                  <div className="absolute top-1 left-1 w-5 h-1 rounded-full" style={{ backgroundColor: p.accent }} />
                  <div className="absolute top-3 left-1 w-3 h-0.5 rounded-full opacity-40" style={{ backgroundColor: p.text }} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">{t.icon}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{t.label}</span>
              </div>
              {active && (
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: 'var(--accent)' }}>✓</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
