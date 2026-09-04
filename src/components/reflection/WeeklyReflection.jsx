// Component: WeeklyReflection
// Purpose: "Your week" — shown inside the Reflection destination once enough
//          days have actually been reflected on. Hidden entirely below that
//          threshold, per "do not overwhelm the user with this immediately".
//
// The AI step is held to the spec's language rule: patterns are offered as
// possibilities ("a pattern appears to be…", "one possible experiment…"),
// never asserted as fact, and never claiming to know the user better than
// they know themselves.
import { useState } from 'react'
import { CalendarRange, Sparkles } from 'lucide-react'
import { buildWeeklyReflection, weeklyFactsForAI } from '../../services/weeklyReflection'
import { callClaude } from '../../services/aiService'
import { usePersistedState } from '../../hooks/usePersistedState'
import { getTodayKey } from '../../utils/dateUtils'

export default function WeeklyReflection({ entriesByDate, todayKey = getTodayKey() }) {
  const weekly = buildWeeklyReflection(entriesByDate, todayKey)
  const [weekIntention, setWeekIntention] = usePersistedState('weekly_intention', '')
  const [pattern, setPattern] = useState('')
  const [ai, setAi] = useState({ loading: false, error: null })

  if (!weekly.enough) return null

  const askForPattern = async () => {
    const facts = weeklyFactsForAI(weekly)
    if (!facts) return
    setAi({ loading: true, error: null })
    try {
      const text = await callClaude(
        `You look for possible patterns in a week of someone's own written reflections.

Rules:
- 3 short sentences maximum, then at most one suggested experiment.
- Use ONLY the facts given. Never invent events, numbers or feelings.
- Offer possibilities, never verdicts. Use phrasing like "you may be noticing",
  "a pattern appears to be", "one possible experiment".
- Never claim to understand them better than they understand themselves.
- Do not diagnose emotions or mental health. Do not praise or scold.`,
        facts,
      )
      const clean = (text || '').trim()
      setPattern(clean)
      setAi({ loading: false, error: clean ? null : 'Nothing came back.' })
    } catch (err) {
      setAi({ loading: false, error: err?.message || 'Could not look for patterns.' })
    }
  }

  const { lived } = weekly

  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center gap-2.5">
        <CalendarRange size={16} strokeWidth={2} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
          Your week
        </p>
      </div>

      <div
        className="rounded-2xl border p-4 space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          You reflected on {weekly.daysReflected} {weekly.daysReflected === 1 ? 'day' : 'days'} this week.
        </p>

        {/* Stated plainly as counts — not a score */}
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Living your intention: {lived.yes} yes · {lived.partially} partly · {lived.not_today} not that day.
        </p>

        {weekly.topIntention && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Most often you set out to be{' '}
            <span style={{ color: 'var(--text)' }}>{String(weekly.topIntention.value).toLowerCase()}</span>.
          </p>
        )}

        {weekly.lessons.length > 0 && (
          <div className="pt-1 space-y-2">
            <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
              What you wrote
            </p>
            <ul className="space-y-1.5">
              {weekly.lessons.slice(0, 4).map(l => (
                <li key={l.dateKey} className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                  “{l.text}”
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Possible pattern — offered, never asserted */}
      {pattern ? (
        <div
          className="rounded-2xl border p-4"
          style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-text)' }}>
            A pattern you may want to notice
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--accent-text)' }}>
            {pattern}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={askForPattern}
          disabled={ai.loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all active:scale-95 disabled:opacity-60"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--surface)' }}
        >
          <Sparkles size={15} aria-hidden="true" />
          {ai.loading ? 'Looking…' : 'Look for a pattern'}
        </button>
      )}

      {ai.error && <p className="text-xs" style={{ color: 'var(--tone-red-text)' }}>{ai.error}</p>}

      {/* Weekly intention — reflection-derived, not a goals system */}
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Next week</p>
        <input
          value={weekIntention}
          onChange={e => setWeekIntention(e.target.value)}
          placeholder="One thing to carry into next week…"
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>
    </section>
  )
}
