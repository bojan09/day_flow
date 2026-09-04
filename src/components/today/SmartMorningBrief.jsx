// Component: SmartMorningBrief
// Purpose: AI-generated morning brief — shows today's priorities, pending habits,
//          weather-style energy forecast. Shown only in morning context (before noon).
//          Generated once per day and cached so it doesn't re-fire on re-render.
import { useState, useEffect } from 'react'
import { callClaude } from '../../services/aiService'
import { format } from 'date-fns'
import { getTodayKey } from '../../utils/dateUtils'

function buildMorningContext({ tasks, habits, mood, goals }) {
  const today      = getTodayKey()
  const todayTasks = tasks.getTodayTasks()
  const highPri    = todayTasks.filter(t => t.priority === 'high')
  const overdue    = tasks.tasks.filter(t => !t.completed && t.date && t.date < today)
  const habitNames = habits.habits.map(h => h.name)
  const activeGoals = goals?.goals.filter(g => !g.completed).slice(0, 2) || []
  const streakMax  = habits.habits.length > 0
    ? Math.max(...habits.habits.map(h => habits.getStreak(h.id)), 0)
    : 0

  return `
MORNING BRIEF — ${format(new Date(), 'EEEE, MMMM d')}

TODAY'S TASKS (${todayTasks.length} scheduled):
${todayTasks.slice(0, 5).map(t => `- [${t.priority}] ${t.title}`).join('\n') || 'None scheduled'}

OVERDUE: ${overdue.length} task${overdue.length !== 1 ? 's' : ''}
HIGH PRIORITY: ${highPri.map(t => t.title).join(', ') || 'none'}

HABITS TO LOG TODAY: ${habitNames.join(', ') || 'none set'}
BEST STREAK: ${streakMax} days

ACTIVE GOALS: ${activeGoals.map(g => g.title).join(', ') || 'none'}
`.trim()
}

export default function SmartMorningBrief({ tasks, habits, mood, goals }) {
  const hour    = new Date().getHours()
  const today   = getTodayKey()
  const [brief,     setBrief]     = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [dismissed, setDismissed] = useState(false)

  // Auto-generate once on mount if morning and no cached brief
  useEffect(() => {
    if (hour >= 12 || hour < 5) return
    if (brief || loading || dismissed) return
    generate()
  }, [])

  const generate = async () => {
    setLoading(true); setError(null)
    try {
      const context  = buildMorningContext({ tasks, habits, mood, goals })
      const text = await callClaude(`You are a morning coach delivering a brief, energising daily briefing.

Format your response exactly like this (no markdown headers, just this structure):

[One energising sentence about the day — upbeat, specific to their data]

🎯 Focus: [The single most important thing to do today — specific task or goal]
⚡ Watch out: [One potential friction point or challenge to be ready for]
💪 Win: [The one small win that will make today feel successful]

Keep the total response under 60 words. Be direct and energising. No fluff.`, context)
      
      setBrief(text)
      // Brief is in-memory only — regenerates each session
    } catch {
      setError('Could not generate brief.')
    } finally {
      setLoading(false)
    }
  }

  const dismiss = () => {
    setDismissed(true)
    // Dismissed state is in-memory only
  }

  // Only show in morning context (5am–noon)
  if (hour >= 12 || hour < 5) return null
  if (dismissed) return null

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--accent-light)',
        borderColor:     'var(--accent-mid)',
        boxShadow:       'var(--shadow-card)',
      }}
    >
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">☀️</span>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Morning Brief
            </p>
          </div>
          <button
            onClick={dismiss}
            className="hover-accent-mid text-xs transition-colors w-6 h-6 flex items-center justify-center rounded-full"
            style={{ color: 'var(--accent)' }}
            aria-label="Dismiss"
          >✕</button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 py-2">
            <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--accent)' }} />
            <span className="text-xs" style={{ color: 'var(--accent)' }}>Preparing your brief…</span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--accent)' }}>Couldn't load brief</p>
            <button onClick={generate} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
              Retry
            </button>
          </div>
        )}

        {brief && !loading && (
          <div className="text-sm leading-relaxed" style={{
            color:      'var(--accent)',
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize:   '0.95rem',
          }}>
            {brief.split('\n').map((line, i) => {
              if (!line.trim()) return null
              // Style the emoji-prefixed lines slightly differently
              const isPoint = /^[🎯⚡💪]/u.test(line)
              return (
                <p
                  key={i}
                  className={`mb-1.5 last:mb-0 ${isPoint ? 'font-semibold' : 'font-light italic'}`}
                  style={{ fontSize: isPoint ? '0.85rem' : '0.95rem' }}
                >
                  {line}
                </p>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
