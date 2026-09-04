// Component: SmartSchedulerPanel
// Purpose: AI-powered scheduling assistant — analyses backlog + schedule gaps
//          and suggests when to do overdue/unscheduled tasks. Uses Anthropic API.
import { useState } from 'react'
import { callClaude } from '../../services/aiService'
import { useSmartScheduler, getAIScheduleSuggestions } from '../../hooks/useSmartScheduler'

function ScheduleBar({ day }) {
  const maxTasks = 8
  const pct      = Math.min((day.taskCount / maxTasks) * 100, 100)
  const color    = day.isHeavy ? '#EF4444' : day.isLight ? '#3B6B4B' : '#F59E0B'

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] w-14 flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
        {day.label.split(' ').slice(0, 2).join(' ')}
      </span>
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(pct, day.taskCount > 0 ? 8 : 0)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] w-8 text-right flex-shrink-0 font-medium" style={{ color: 'var(--text-muted)' }}>
        {day.taskCount}t
      </span>
    </div>
  )
}

export default function SmartSchedulerPanel({ tasks, energy, habits, onTabChange }) {
  const { analysis, buildAIContext } = useSmartScheduler({ tasks, energy, habits })
  const [output,  setOutput]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [open,    setOpen]    = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiTargets,     setAiTargets]     = useState([])
  const [loadingAI,     setLoadingAI]     = useState(false)

  const generate = async () => {
    setLoading(true); setError(null); setOutput('')
    try {
      const context  = buildAIContext()
      const text = await callClaude(`You are a focused productivity scheduler. Given the user's task backlog and 7-day schedule, provide:

1. **Reschedule these first:** List 2-3 overdue tasks with specific day suggestions (e.g. "Move 'X' to Thursday — it's your lightest day")
2. **Schedule gaps:** Identify 1-2 days with room for unscheduled tasks
3. **One warning:** If any day is overloaded, flag it with a specific suggestion

Rules:
- Be specific: name actual tasks and days, never generic advice
- Keep it under 120 words total
- Don't mention "based on data" — speak directly like a coach`, context)
      setOutput(text)
    } catch {
      setError('Could not reach AI. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const { overdue, unscheduled, next7, lightDays, avgCompletion } = analysis

  const fetchAISuggestions = async () => {
    setLoadingAI(true)
    const targets = [...overdue, ...unscheduled]
    const suggestions = await getAIScheduleSuggestions(targets, next7, analysis.todayEnergy)
    setAiTargets(targets)
    setAiSuggestions(suggestions)
    setLoadingAI(false)
  }

  const acceptSuggestion = (s) => {
    tasks.updateTask(s.taskId, { date: s.suggestedDate })
    setAiSuggestions(prev => prev.filter(x => x.taskId !== s.taskId))
  }
  const dismissSuggestion = (s) => setAiSuggestions(prev => prev.filter(x => x.taskId !== s.taskId))

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header — tap to expand */}
      <button
        onClick={() => setOpen(v => !v)}
        className="hover-surface w-full flex items-center justify-between px-5 py-4 transition-colors text-left"
        style={{ minHeight: '60px' }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            🤖 Smart Scheduler
          </p>
          <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text)' }}>
            {overdue.length > 0
              ? `${overdue.length} overdue · ${unscheduled.length} unscheduled`
              : unscheduled.length > 0
              ? `${unscheduled.length} unscheduled tasks`
              : 'Schedule looks good'}
          </p>
        </div>
        <span
          className="text-xs transition-transform duration-200"
          style={{ color: 'var(--text-faint)', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}
        >▼</span>
      </button>

      {open && (
        <div className="border-t px-5 pb-5" style={{ borderColor: 'var(--border-soft)' }}>

          {/* 7-day load bars */}
          <div className="mt-4 space-y-2 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-faint)' }}>
              7-day workload
            </p>
            {next7.map(d => <ScheduleBar key={d.dateKey} day={d} />)}
          </div>

          {/* Stats row */}
          <div className="flex gap-2 mb-4">
            {[
              { label: 'Overdue',     value: overdue.length,     warn: overdue.length > 0     },
              { label: 'Unscheduled', value: unscheduled.length, warn: unscheduled.length > 3 },
              { label: 'Light days',  value: lightDays.length,   warn: false                  },
              { label: 'Avg done',    value: avgCompletion !== null ? `${avgCompletion}%` : '—', warn: avgCompletion !== null && avgCompletion < 50 },
            ].map(s => (
              <div
                key={s.label}
                className="flex-1 text-center py-2 rounded-xl border"
                style={{
                  backgroundColor: s.warn ? '#FEF2F2' : 'var(--bg-secondary)',
                  borderColor:     s.warn ? '#FECACA' : 'var(--border)',
                }}
              >
                <p className="font-serif text-lg leading-none" style={{ color: s.warn ? '#DC2626' : 'var(--text)' }}>
                  {s.value}
                </p>
                <p className="text-[9px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--text-faint)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* AI suggestion */}
          {!output && !loading && (
            <button
              onClick={generate}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: 'var(--accent)', minHeight: '48px' }}
            >
              ✦ Get scheduling suggestions
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-3 py-5">
              <span
                className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--accent)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Analysing your schedule…</span>
            </div>
          )}

          {error && (
            <div className="space-y-2">
              <p className="text-sm text-red-500">{error}</p>
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
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor:     'var(--border)',
                  color:           'var(--text)',
                  lineHeight:      '1.7',
                }}
              >
                {output.split('\n').map((line, i) => {
                  const bold = line.match(/^\*\*(.+?):\*\*(.*)/)
                  if (bold) return (
                    <p key={i} className="mb-2 last:mb-0">
                      <strong style={{ color: 'var(--accent-text)' }}>{bold[1]}:</strong>
                      {bold[2]}
                    </p>
                  )
                  return line ? <p key={i} className="mb-1.5 last:mb-0">{line}</p> : null
                })}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onTabChange?.('tasks')}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Open Tasks →
                </button>
                <button
                  onClick={() => setOutput('')}
                  className="hover-surface px-4 py-2.5 rounded-xl border text-sm transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
                >
                  ↻
                </button>
              </div>
            </div>
          )}

          {/* AI schedule suggestions (on-demand, additive to heuristic block above) */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
            <button
              onClick={fetchAISuggestions}
              disabled={loadingAI}
              className="w-full py-2.5 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-60"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              {loadingAI ? 'Thinking…' : '✨ Get AI suggestions'}
            </button>

            {aiSuggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                {aiSuggestions.map(s => {
                  const target = aiTargets.find(t => t.id === s.taskId) || tasks.tasks.find(t => t.id === s.taskId)
                  return (
                    <div
                      key={s.taskId}
                      className="rounded-xl border p-3"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                    >
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                        {target?.title || 'Task'} → <span style={{ color: 'var(--accent-text)' }}>{s.suggestedDate}</span>
                      </p>
                      {s.reason && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{s.reason}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => acceptSuggestion(s)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => dismissSuggestion(s)}
                          className="hover-surface px-3 py-1.5 rounded-lg border text-xs transition-colors"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
