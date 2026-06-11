// Component: FeatureTooltip
// Purpose: One-time contextual hint for complex features.
//          Shows a small popover the first time a user encounters a feature.
//          Dismissed state persisted via usePersistedState (Supabase).
import { useState, useEffect } from 'react'
import { usePersistedState } from '../../hooks/usePersistedState'

// Registry of all feature hints
export const FEATURE_HINTS = {
  'smart-scheduler': {
    title:   '🤖 Smart Scheduler',
    body:    'Click to get AI-powered suggestions for rescheduling overdue tasks.',
    anchor:  'bottom',
  },
  'voice-command': {
    title:   '🎙 Voice Commands',
    body:    'Tap the mic and say "Add task…", "Log habit…", or "Note…"',
    anchor:  'left',
  },
  'widget-customize': {
    title:   '✦ Customize Today',
    body:    'Pin widgets to the top, hide ones you don\'t use, or reorder them.',
    anchor:  'bottom',
  },
  'quick-capture': {
    title:   '⚡ Quick Capture',
    body:    'Tap + anywhere to instantly add tasks, ideas, notes, or log habits.',
    anchor:  'left',
  },
  'habit-optimizer': {
    title:   '🔄 Habit Optimizer',
    body:    'AI analyses 28 days of data to suggest why habits keep getting skipped.',
    anchor:  'bottom',
  },
}

export default function FeatureTooltip({ id, children }) {
  const storageKey = `hint_dismissed_${id}`
  const [dismissed, setDismissed] = usePersistedState(storageKey, false)
  const [visible,   setVisible]   = useState(false)
  const hint = FEATURE_HINTS[id]

  // Show after 800ms on first visit
  useEffect(() => {
    if (dismissed || !hint) return
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [dismissed, hint])

  const dismiss = () => {
    setVisible(false)
    setDismissed(true)
  }

  if (!hint) return children

  return (
    <div className="relative inline-block">
      {children}

      {visible && !dismissed && (
        <div
          className="absolute z-50 animate-spring-in"
          style={{
            [hint.anchor === 'bottom' ? 'top' : 'right']:    'calc(100% + 8px)',
            [hint.anchor === 'bottom' ? 'left' : 'top']:     '50%',
            transform: hint.anchor === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)',
            width:     '220px',
          }}
        >
          <div
            className="rounded-2xl border p-3 shadow-lg"
            style={{
              backgroundColor: 'var(--accent)',
              borderColor:     'var(--accent)',
              boxShadow:       '0 4px 20px rgba(59,107,75,0.3)',
            }}
          >
            {/* Arrow */}
            <div
              className="absolute w-2.5 h-2.5 rotate-45"
              style={{
                backgroundColor: 'var(--accent)',
                [hint.anchor === 'bottom' ? 'top' : 'right']:  '-5px',
                [hint.anchor === 'bottom' ? 'left' : 'top']:   'calc(50% - 5px)',
              }}
            />
            <p className="text-xs font-semibold text-white mb-0.5">{hint.title}</p>
            <p className="text-[11px] text-white opacity-90 leading-snug">{hint.body}</p>
            <button aria-label="Dismiss tip"
              onClick={dismiss}
              className="mt-2 text-[10px] text-white opacity-75 hover:opacity-100 transition-opacity"
            >
              Got it ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
