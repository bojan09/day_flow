// Component: KeyboardShortcuts
// Purpose: Global keyboard shortcuts — single key nav + ? help overlay.
//          Uses CSS variables so it respects the active theme.
import { useEffect, useState } from 'react'

const SHORTCUTS = [
  { key: 'T', desc: 'Today'      }, { key: 'K', desc: 'Tasks'    },
  { key: 'C', desc: 'Calendar'   }, { key: 'N', desc: 'Notes'    },
  { key: 'H', desc: 'Habits'     }, { key: 'G', desc: 'Goals'    },
  { key: 'W', desc: 'Workouts'   }, { key: 'I', desc: 'Ideas'    },
  { key: 'F', desc: 'Focus'      }, { key: 'R', desc: 'Routines' },
  { key: 'B', desc: 'Brain Dump'},
  { key: '/', desc: 'Search'     }, { key: '?', desc: 'This menu' },
]

const KEY_MAP = {
  't': 'today',     'k': 'tasks',    'c': 'calendar',
  'n': 'notes',     'h': 'habits',   'g': 'goals',
  'w': 'workouts',  'i': 'ideas',    'f': 'focus',
  'r': 'routines',  'b': 'braindump',
  '/': 'search',
}

export default function KeyboardShortcuts({ onTabChange }) {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (KEY_MAP[k]) { onTabChange(KEY_MAP[k]); return }
      if (e.key === '?')      { setShowHelp(s => !s); return }
      if (e.key === 'Escape') { setShowHelp(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onTabChange])

  if (!showHelp) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'var(--overlay)' }}
      onClick={() => setShowHelp(false)}
    >
      <div
        className="rounded-2xl p-6 w-72 animate-scale-in"
        style={{
          backgroundColor: 'var(--surface)',
          boxShadow:       'var(--shadow-modal)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg" style={{ color: 'var(--text)' }}>
            Keyboard shortcuts
          </h3>
          <button aria-label="Close shortcuts"
            onClick={() => setShowHelp(false)}
            className="tap-target text-sm transition-colors"
            style={{ color: 'var(--text-faint)' }}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</span>
              <kbd
                className="rounded px-1.5 py-0.5 text-xs font-mono border"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor:     'var(--border)',
                  color:           'var(--text-muted)',
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-center mt-5" style={{ color: 'var(--text-faint)' }}>
          Press <kbd
            className="rounded px-1 text-xs font-mono border"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >Esc</kbd> to close
        </p>
      </div>
    </div>
  )
}
