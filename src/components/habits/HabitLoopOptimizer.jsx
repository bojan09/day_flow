// Component: HabitLoopOptimizer
// Purpose: AI-powered habit analysis — detects which habits keep getting skipped,
//          identifies patterns (skipped on weekends, evenings, etc.) and suggests
//          specific changes using the Anthropic API.
import { useState, useMemo } from 'react'
import { subDays, getDay, format } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

const DOW = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function buildHabitContext(habits) {
  const last28 = Array.from({ length: 28 }, (_, i) => {
    const d = subDays(new Date(), i)
    return { dateKey: getDateKey(d), dow: getDay(d), label: format(d, 'EEE MMM d') }
  })

  const analysis = habits.habits.map(h => {
    const doneByDOW  = Array(7).fill(0)
    const totalByDOW = Array(7).fill(0)
    let streak = habits.getStreak(h.id)
    let totalDone = 0, totalDays = last28.length

    last28.forEach(d => {
      totalByDOW[d.dow]++
      if (habits.isHabitDone(h.id, d.dateKey)) {
        doneByDOW[d.dow]++
        totalDone++
      }
    })

    const consistency = Math.round((totalDone / totalDays) * 100)
    const weakDays    = DOW.filter((_, i) => totalByDOW[i] > 0 && (doneByDOW[i] / totalByDOW[i]) < 0.4)
    const strongDays  = DOW.filter((_, i) => totalByDOW[i] > 0 && (doneByDOW[i] / totalByDOW[i]) >= 0.8)

    return { name: h.name, icon: h.icon, streak, consistency, weakDays, strongDays }
  })

  const problemHabits = analysis
    .filter(h => h.consistency < 60)
    .sort((a, b) => a.consistency - b.consistency)
    .slice(0, 5)

  return {
    summary: analysis.map(h =>
      `${h.icon} ${h.name}: ${h.consistency}% consistency, streak ${h.streak}d` +
      (h.weakDays.length ? `, often skipped on ${h.weakDays.join(', ')}` : '') +
      (h.strongDays.length ? `, strong on ${h.strongDays.join(', ')}` : '')
    ).join('\n'),
    problemHabits,
    total: habits.habits.length,
  }
}

export default function HabitLoopOptimizer({ habits }) {
  const [output,  setOutput]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const context = useMemo(() => buildHabitContext(habits), [habits])

  if (habits.habits.length === 0) return null

  const generate = async () => {
    setLoading(true); setError(null); setOutput('')
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a habit coach analysing a user's habit consistency data from the last 28 days.

Provide exactly 3 actionable suggestions in this format:

**[Habit name]:** [Specific change to make — e.g. "Move to morning before breakfast", "Reduce from daily to 5x/week", "Pair with your existing coffee ritual"]
Why: [One sentence — why this specific change will help]

Rules:
- Only suggest changes for habits with <60% consistency
- Be specific about WHEN and HOW — not just "try harder"
- Keep each suggestion under 30 words total
- If all habits are above 60%, say "All habits are performing well — keep going!"`,
          messages: [{ role: 'user', content: `HABIT DATA (last 28 days):\n${context.summary}` }],
        }),
      })
      if (!response.ok) throw new Error(`${response.status}`)
      const data = await response.json()
      setOutput(data.content?.[0]?.text || '')
    } catch (err) {
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
      <div className="px-5 pt-5 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
          🔄 Habit Loop Optimizer
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          AI analyses your 28-day patterns and suggests specific adjustments
        </p>

        {/* Problem habits preview */}
        {context.problemHabits.length > 0 && !output && (
          <div className="mt-3 space-y-1.5">
            {context.problemHabits.map(h => (
              <div key={h.name} className="flex items-center gap-2.5">
                <span className="text-base">{h.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{h.name}</span>
                    <span className="text-[10px] font-semibold ml-2 flex-shrink-0"
                      style={{ color: h.consistency < 30 ? '#EF4444' : '#F59E0B' }}>
                      {h.consistency}%
                    </span>
                  </div>
                  <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:           `${h.consistency}%`,
                        backgroundColor: h.consistency < 30 ? '#EF4444' : '#F59E0B',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {context.problemHabits.length === 0 && !output && (
          <p className="text-xs mt-2 font-medium" style={{ color: '#10B981' }}>
            ✓ All habits above 60% — performing well!
          </p>
        )}

        <div className="mt-4">
          {!output && !loading && (
            <button
              onClick={generate}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              ✦ Analyse my habits
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-3 py-4">
              <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--accent)' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Analysing patterns…</span>
            </div>
          )}

          {error && (
            <div className="space-y-2">
              <p className="text-xs text-red-500">{error}</p>
              <button onClick={generate}
                className="w-full py-2 rounded-xl border text-sm transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                Try again
              </button>
            </div>
          )}

          {output && (
            <div className="space-y-3">
              <div
                className="rounded-xl p-4 border text-sm leading-relaxed"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)', lineHeight: '1.7' }}
              >
                {output.split('\n').map((line, i) => {
                  const bold = line.match(/^\*\*(.+?):\*\*(.*)/)
                  if (bold) return (
                    <p key={i} className="mb-2">
                      <strong style={{ color: 'var(--accent)' }}>{bold[1]}:</strong>{bold[2]}
                    </p>
                  )
                  const why = line.match(/^Why: (.+)/)
                  if (why) return (
                    <p key={i} className="mb-3 pl-3 border-l-2 text-xs italic"
                      style={{ borderColor: 'var(--accent-mid)', color: 'var(--text-muted)' }}>
                      {why[1]}
                    </p>
                  )
                  return line ? <p key={i} className="mb-1">{line}</p> : null
                })}
              </div>
              <button
                onClick={() => setOutput('')}
                className="w-full py-2 rounded-xl border text-xs transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ↻ Re-analyse
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
