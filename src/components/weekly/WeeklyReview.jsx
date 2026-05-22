// Component: WeeklyReview
// Purpose: Sunday weekly review — shows week stats AND generates an AI draft
//          summary with reflection prompts. Shows any day (not just Sunday) via
//          manual trigger, and auto-shows on Sunday.
import { useState, useMemo } from 'react'
import { subDays, format }   from 'date-fns'
import { MOODS }             from '../../hooks/useMood'
import { getDateKey }        from '../../utils/dateUtils'

const isSunday = () => new Date().getDay() === 0

function buildWeekContext({ tasks, habits, mood, notes }) {
  const last7     = Array.from({ length: 7 }, (_, i) => getDateKey(subDays(new Date(), i)))
  const allTasks  = tasks?.tasks || []
  const allHabits = habits?.habits || []
  const weekTasks = allTasks.filter(t => last7.includes(t.date))
  const done      = weekTasks.filter(t => t.completed).length
  const rate      = weekTasks.length > 0 ? Math.round((done / weekTasks.length) * 100) : 0
  const history   = mood?.getHistory?.(7) || []
  const avgMood   = history.length
    ? (history.reduce((s, m) => s + m.score, 0) / history.length).toFixed(1) : null
  const habitDays = allHabits.map(h => ({
    name: h.name,
    pct:  Math.round((last7.filter(d => habits.isHabitDone(h.id, d)).length / 7) * 100),
  }))
  const topHabit  = habitDays.sort((a, b) => b.pct - a.pct)[0]
  const lowHabit  = [...habitDays].sort((a, b) => a.pct - b.pct)[0]
  const bestStreak = allHabits.length > 0
    ? Math.max(...allHabits.map(h => habits.getStreak(h.id)), 0) : 0
  const weekNotes = (notes?.notes || []).filter(n =>
    n.createdAt && last7.includes(n.createdAt.split('T')[0])
  ).length

  return {
    weekOf:    format(subDays(new Date(), 6), 'MMM d'),
    weekEnd:   format(new Date(), 'MMM d'),
    tasks:     { done, total: weekTasks.length, rate },
    avgMood,
    topHabit,
    lowHabit,
    bestStreak,
    weekNotes,
    habitCount: habits.habits.length,
    raw: { last7, weekTasks, done, rate, avgMood, bestStreak, topHabit, lowHabit },
  }
}

export default function WeeklyReview({ tasks, habits, mood, notes, onClose }) {
  const [dismissed,  setDismissed] = useState(false)
  const [aiDraft,    setAiDraft]   = useState('')
  const [loading,    setLoading]   = useState(false)
  const [error,      setError]     = useState(null)
  const [next,       setNext]      = useState('')

  const ctx = useMemo(() => buildWeekContext({ tasks, habits, mood, notes }), [tasks, habits, mood, notes])

  if (dismissed) return null

  const handleClose = () => { setDismissed(true); onClose?.() }

  const generateDraft = async () => {
    setLoading(true); setError(null); setAiDraft('')
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a thoughtful personal coach writing a weekly review draft for the user.
Write a warm, personal 3-paragraph review in first person (as if the user wrote it).
Paragraph 1: What happened this week — reference specific numbers naturally.
Paragraph 2: What went well and what was challenging — be honest, not just positive.
Paragraph 3: One clear intention or focus for next week based on the patterns.
Keep it under 120 words. No headers, no bullet points. Conversational and genuine.`,
          messages: [{
            role: 'user',
            content: `Week of ${ctx.weekOf} – ${ctx.weekEnd}:
Tasks: ${ctx.tasks.done}/${ctx.tasks.total} completed (${ctx.tasks.rate}%)
Mood average: ${ctx.avgMood ? `${ctx.avgMood}/5` : 'not tracked'}
Best habit streak: ${ctx.bestStreak} days
Top habit: ${ctx.topHabit ? `${ctx.topHabit.name} (${ctx.topHabit.pct}%)` : 'none'}
Struggled with: ${ctx.lowHabit ? `${ctx.lowHabit.name} (${ctx.lowHabit.pct}%)` : 'none'}
Notes written: ${ctx.weekNotes}`,
          }],
        }),
      })
      if (!response.ok) throw new Error(`${response.status}`)
      const data = await response.json()
      setAiDraft(data.content?.[0]?.text || '')
    } catch (err) {
      setError('Could not generate draft. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: 'var(--overlay)' }}
    >
      <div
        className="w-full sm:max-w-lg rounded-3xl overflow-hidden animate-spring-in"
        style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-modal)' }}
      >
        {/* Header */}
        <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-mid) 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-widest">Weekly Review</p>
              <h2 className="text-white font-serif text-xl mt-0.5">
                {ctx.weekOf} — {ctx.weekEnd}
              </h2>
            </div>
            <button type="button" onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-px" style={{ backgroundColor: 'var(--border)' }}>
          {[
            { label: 'Tasks', value: `${ctx.tasks.done}/${ctx.tasks.total}`, sub: `${ctx.tasks.rate}%` },
            { label: 'Avg mood', value: ctx.avgMood ? `${ctx.avgMood}/5` : '—', sub: 'this week' },
            { label: 'Best streak', value: `${ctx.bestStreak}d`, sub: 'current' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center py-4"
              style={{ backgroundColor: 'var(--surface)' }}>
              <p className="font-serif text-xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: '45vh' }}>

          {/* Habit highlights */}
          {ctx.topHabit && (
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>⭐ Best: {ctx.topHabit.name}</span>
              <span className="font-semibold" style={{ color: '#10B981' }}>{ctx.topHabit.pct}%</span>
            </div>
          )}
          {ctx.lowHabit && ctx.lowHabit.pct < 60 && (
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>⚠️ Needs work: {ctx.lowHabit.name}</span>
              <span className="font-semibold" style={{ color: '#F59E0B' }}>{ctx.lowHabit.pct}%</span>
            </div>
          )}

          {/* AI Draft */}
          {!aiDraft && !loading && (
            <button type="button" onClick={generateDraft}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: 'var(--accent)' }}>
              ✦ Generate AI review draft
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-3">
              <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--accent)' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Writing your review…</span>
            </div>
          )}

          {error && <p className="text-xs text-center text-red-500">{error}</p>}

          {aiDraft && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold mb-2"
                style={{ color: 'var(--text-faint)' }}>AI draft — edit freely</p>
              <textarea
                value={aiDraft}
                onChange={e => setAiDraft(e.target.value)}
                className="w-full text-sm rounded-2xl p-4 outline-none border resize-none leading-relaxed"
                rows={5}
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
          )}

          {/* Next week intention */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2"
              style={{ color: 'var(--text-faint)' }}>One intention for next week</p>
            <input
              value={next}
              onChange={e => setNext(e.target.value)}
              placeholder="What matters most next week?"
              className="input-base w-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button type="button" onClick={handleClose}
            className="flex-1 py-3 rounded-2xl border text-sm font-medium"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            Close
          </button>
          <button type="button"
            onClick={() => {
              if (next.trim() && notes?.addNote) {
                notes.addNote({ title: `Week of ${ctx.weekOf}`, content: `${aiDraft}\n\nNext week: ${next}`, tags: ['weekly-review'] })
              }
              handleClose()
            }}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}>
            Save & close
          </button>
        </div>
      </div>
    </div>
  )
}
