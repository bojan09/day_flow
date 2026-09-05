// Component: WeeklyReflection
// Purpose: "Your week" — shown inside the Reflection destination once enough
//          days have actually been reflected on. Hidden entirely below that
//          threshold, per "do not overwhelm the user with this immediately".
//
// Reports only what was counted — the interpretation is left to the user.
import { CalendarRange } from 'lucide-react'
import { buildWeeklyReflection } from '../../services/weeklyReflection'
import { usePersistedState } from '../../hooks/usePersistedState'
import { getTodayKey } from '../../utils/dateUtils'

export default function WeeklyReflection({ entriesByDate, todayKey = getTodayKey() }) {
  const weekly = buildWeeklyReflection(entriesByDate, todayKey)
  const [weekIntention, setWeekIntention] = usePersistedState('weekly_intention', '')

  if (!weekly.enough) return null

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
