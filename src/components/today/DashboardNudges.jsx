// Component: DashboardNudges
// Purpose: Surfaces 1–3 smart nudges at the top of Today based on context and behaviour.
//          Nudges auto-dismiss on action click or can be manually dismissed.
import { useState } from 'react'

const TYPE_STYLES = {
  success: { bg: 'var(--accent-light)', border: 'var(--accent-mid)',  text: 'var(--accent-text)',      icon: '✓'  },
  warning: { bg: 'var(--tone-amber-bg)',             border: 'var(--tone-amber-border)',            text: 'var(--tone-amber-text)',             icon: '⚠'  },
  nudge:   { bg: 'var(--bg-secondary)', border: 'var(--border)',      text: 'var(--text-muted)',   icon: '💡' },
  mood:    { bg: 'var(--tone-blue-bg)',             border: 'var(--tone-blue-border)',            text: 'var(--tone-blue-text)',             icon: '😊' },
}

export default function DashboardNudges({ nudges, onTabChange }) {
  const [dismissed, setDismissed] = useState(new Set())

  const visible = nudges.filter(n => !dismissed.has(n.id))
  if (visible.length === 0) return null

  return (
    <div className="space-y-2">
      {visible.map(nudge => {
        const style = TYPE_STYLES[nudge.type] || TYPE_STYLES.nudge
        return (
          <div
            key={nudge.id}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm animate-fade-down"
            style={{ backgroundColor: style.bg, borderColor: style.border }}
          >
            <span className="flex-shrink-0">{style.icon}</span>
            <p className="flex-1 text-xs leading-snug" style={{ color: style.text }}>
              {nudge.message}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              {nudge.action && nudge.tab && (
                <button
                  onClick={() => { onTabChange(nudge.tab); setDismissed(s => new Set([...s, nudge.id])) }}
                  className="text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: style.text }}
                >
                  {nudge.action}
                </button>
              )}
              <button
                onClick={() => setDismissed(s => new Set([...s, nudge.id]))}
                className="text-xs opacity-40 hover:opacity-70 transition-opacity"
                style={{ color: style.text }}
              >
                ✕
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
