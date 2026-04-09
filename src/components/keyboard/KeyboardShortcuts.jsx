// Component: KeyboardShortcuts
// Purpose: Global keyboard shortcuts + ? help overlay
import { useEffect, useState } from 'react'

const SHORTCUTS = [
  { key: 'T', desc: 'Today'      }, { key: 'K', desc: 'Tasks'    },
  { key: 'C', desc: 'Calendar'   }, { key: 'N', desc: 'Notes'    },
  { key: 'H', desc: 'Habits'     }, { key: 'G', desc: 'Goals'    },
  { key: 'I', desc: 'Ideas'      }, { key: 'B', desc: 'Brain Dump'},
  { key: 'F', desc: 'Focus'      }, { key: 'R', desc: 'Routines' },
  { key: '/', desc: 'Search'     }, { key: '?', desc: 'This menu' },
]

export default function KeyboardShortcuts({ onTabChange }) {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      const map = {
        't': 'today', 'k': 'tasks', 'c': 'calendar', 'n': 'notes',
        'h': 'habits', 'g': 'goals', 'i': 'ideas', 'b': 'braindump',
        'f': 'focus', 'r': 'routines', '/': 'search',
      }
      if (map[k]) { onTabChange(map[k]); return }
      if (e.key === '?') { setShowHelp(s => !s); return }
      if (e.key === 'Escape') setShowHelp(false)
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
          <button onClick={() => setShowHelp(false)} className="text-ink-faint hover:text-ink text-sm">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-xs text-ink-muted">{s.desc}</span>
              <kbd className="bg-stone-100 text-ink-muted border border-stone-200 rounded px-1.5 py-0.5 text-xs font-mono">{s.key}</kbd>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-ink-faint text-center mt-4">Press <kbd className="bg-stone-100 px-1 rounded text-xs">Esc</kbd> to close</p>
      </div>
    </div>
  )
}
