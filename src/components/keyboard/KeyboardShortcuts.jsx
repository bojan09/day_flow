// Component: KeyboardShortcuts
// Purpose: Global keyboard shortcut handler + help overlay (press ?)
import { useEffect, useState } from 'react'

const SHORTCUTS = [
  { key: 'T', desc: 'Go to Today'    },
  { key: 'K', desc: 'Go to Tasks'    },
  { key: 'N', desc: 'Go to Notes'    },
  { key: 'H', desc: 'Go to Habits'   },
  { key: 'G', desc: 'Go to Goals'    },
  { key: 'F', desc: 'Go to Focus'    },
  { key: '/', desc: 'Search'         },
  { key: '?', desc: 'Show shortcuts' },
]

export default function KeyboardShortcuts({ onTabChange }) {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      // Ignore when typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      switch (e.key.toLowerCase()) {
        case 't': onTabChange('today');    break
        case 'k': onTabChange('tasks');    break
        case 'n': onTabChange('notes');    break
        case 'h': onTabChange('habits');   break
        case 'g': onTabChange('goals');    break
        case 'f': onTabChange('focus');    break
        case '/': onTabChange('search');   break
        case '?': setShowHelp(s => !s);   break
        case 'escape': setShowHelp(false); break
        default: break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onTabChange])

  if (!showHelp) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm"
         onClick={() => setShowHelp(false)}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-72 animate-scale-in"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-ink">Keyboard shortcuts</h3>
          <button onClick={() => setShowHelp(false)}
            className="text-ink-faint hover:text-ink text-sm transition-colors">✕</button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">{s.desc}</span>
              <kbd className="bg-stone-100 text-ink-muted border border-stone-200 rounded-lg px-2 py-0.5 text-xs font-mono">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-ink-faint text-center mt-4">Press <kbd className="bg-stone-100 px-1 rounded text-xs">Esc</kbd> to close</p>
      </div>
    </div>
  )
}
