// Component: AIDailyFeedback
// Purpose: Generates a short personalised daily reflection using the Anthropic API.
//          Uses real task, habit, mood, and water data — nothing fabricated.
import { useState } from 'react'
import { callClaude } from '../../services/aiService'
import { format, subDays } from 'date-fns'
import { getTodayKey, getDateKey } from '../../utils/dateUtils'

function buildDayContext({ tasks, habits, mood, water }) {
  const today    = getTodayKey()
  const dayTasks = tasks.tasks.filter(t => t.date === today)
  const done     = dayTasks.filter(t => t.completed)
  const pending  = dayTasks.filter(t => !t.completed)
  const todayMood = mood.getTodayMood()
  const habitsDone = habits.habits.filter(h => habits.isHabitDone(h.id, today))
  const waterData  = water?.getProgress()

  // Last 7-day habit consistency
  const last7Active = Array.from({ length: 7 }, (_, i) =>
    getDateKey(subDays(new Date(), i))
  ).filter(d => habits.habits.some(h => habits.isHabitDone(h.id, d))).length

  return `
DATE: ${format(new Date(), 'EEEE, MMMM d, yyyy')}

TASKS:
- Completed: ${done.map(t => t.title).join(', ') || 'none'}
- Pending: ${pending.map(t => t.title).join(', ') || 'none'}

HABITS (${habitsDone.length}/${habits.habits.length} done today):
${habitsDone.map(h => `- ${h.name}`).join('\n') || '- none logged'}

MOOD: ${todayMood ? `${todayMood.score}/5` : 'not logged'}
WATER: ${waterData ? `${waterData.count}/${waterData.goal} glasses` : 'not tracked'}
7-DAY HABIT CONSISTENCY: ${last7Active}/7 days active
`.trim()
}

export default function AIDailyFeedback({ tasks, habits, mood, water }) {
  const [output,  setOutput]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError(null)
    setOutput('')

    try {
      const context = buildDayContext({ tasks, habits, mood, water })

      const text = await callClaude(`You are a warm, insightful daily productivity coach giving end-of-day feedback.

Based on the user's actual data, provide a personalised daily reflection in exactly this format:

**What went well:** [1-2 sentences — find something genuine to celebrate, even small]
**What to improve:** [1 specific, actionable suggestion for tomorrow — not generic]
**Tomorrow's focus:** [One clear priority or intention for tomorrow]

Keep it under 80 words total. Be direct and personal. Sound like a coach, not a robot.
Never say "it seems" or "based on the data". Just speak directly.`, context)
      
      setOutput(text)
      setGenerated(true)
    } catch {
      setError('Could not reach AI. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
          🤖 AI Daily Feedback
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Personalised reflection based on your actual day
        </p>
      </div>

      <div className="p-5">
        {!generated && !loading && (
          <button
            onClick={generate}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: 'var(--accent)', minHeight: '52px' }}
          >
            Generate today's reflection
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-6">
            <span
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0"
              style={{ borderColor: 'var(--accent)' }}
            />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Reflecting on your day…
            </span>
          </div>
        )}

        {error && (
          <div className="space-y-3">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={generate}
              className="w-full py-2.5 rounded-xl text-sm font-medium border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              Try again
            </button>
          </div>
        )}

        {output && (
          <div className="space-y-4">
            {/* Formatted output */}
            <div
              className="rounded-xl p-4 border text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor:     'var(--border)',
                color:           'var(--text)',
                fontFamily:      '"Cormorant Garamond", Georgia, serif',
                fontSize:        '0.95rem',
                lineHeight:      '1.7',
              }}
            >
              {/* Bold the section headers */}
              {output.split('\n').map((line, i) => {
                const boldMatch = line.match(/^\*\*(.+?):\*\*(.*)/)
                if (boldMatch) {
                  return (
                    <p key={i} className="mb-2 last:mb-0">
                      <strong style={{ color: 'var(--accent-text)', fontFamily: 'inherit' }}>
                        {boldMatch[1]}:
                      </strong>
                      <span style={{ color: 'var(--text)' }}>{boldMatch[2]}</span>
                    </p>
                  )
                }
                return line ? <p key={i} className="mb-2 last:mb-0">{line}</p> : null
              })}
            </div>

            {/* Regenerate */}
            <button
              onClick={() => { setGenerated(false); setOutput('') }}
              className="hover-surface w-full py-2 rounded-xl text-xs font-medium border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
            >
              ↻ Generate again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
