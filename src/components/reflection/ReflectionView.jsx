// Component: ReflectionView
// Purpose: The single Daily Reflection destination. Decides which half of the
//          ritual to open — morning or evening — so the navigation only ever
//          needs one entry, per the spec's "do NOT automatically add multiple
//          permanent navigation items".
import MorningReview from './MorningReview'
import EveningReview from './EveningReview'
import { useReflections } from '../../hooks/useReflections'
import { getTodayKey } from '../../utils/dateUtils'
import { Sun, Moon, Check } from 'lucide-react'

// Morning runs until noon; evening opens from 5pm. Between the two the user
// can still open either deliberately — this only picks the default.
export const isMorningWindow = (hour) => hour < 12
export const isEveningWindow = (hour) => hour >= 17

function SummaryRows({ rows }) {
  return (
    <div className="space-y-5">
      {rows.map(([label, value]) => (
        <div key={label} className="space-y-1">
          <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>{label}</p>
          <p className="font-serif text-xl leading-snug" style={{ color: 'var(--text)' }}>{value}</p>
        </div>
      ))}
    </div>
  )
}

export default function ReflectionView({ tasks, habits, routines, onTabChange }) {
  const dateKey     = getTodayKey()
  const reflections = useReflections(dateKey)
  const hour        = new Date().getHours()
  const entry       = reflections.entry

  const backToToday = () => onTabChange?.('today')

  // Evening takes precedence once its window opens, so someone who opens the
  // app at night is not sent back through the morning first.
  const wantsEvening = isEveningWindow(hour) || reflections.morningDone

  if (!reflections.morningDone && !isEveningWindow(hour)) {
    return <MorningReview reflections={reflections} tasks={tasks} onClose={backToToday} dateKey={dateKey} />
  }

  if (wantsEvening && !reflections.eveningDone) {
    return (
      <EveningReview
        reflections={reflections}
        tasks={tasks}
        habits={habits}
        routines={routines}
        onClose={backToToday}
        dateKey={dateKey}
      />
    )
  }

  // ── Day closed ────────────────────────────────────────────────────────────
  if (reflections.eveningDone) {
    const rows = [
      ['What today taught you', entry.lesson],
      ['Tomorrow remembers',    entry.carryForward],
    ].filter(([, v]) => v && String(v).trim())

    return (
      <div className="max-w-xl mx-auto px-1 pt-8 pb-8 space-y-7">
        <div className="flex items-center gap-2.5">
          <Moon size={18} strokeWidth={2} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            Your day is closed
          </p>
        </div>

        {entry.aiReflection && (
          <div
            className="rounded-2xl border p-4"
            style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
          >
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--accent-text)' }}>
              {entry.aiReflection}
            </p>
          </div>
        )}

        {rows.length > 0 ? <SummaryRows rows={rows} /> : (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Your evening reflection is saved.
          </p>
        )}

        {reflections.streak > 1 && (
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {reflections.streak} days reflected on in a row.
          </p>
        )}

        <button
          type="button"
          onClick={backToToday}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Go to today
        </button>
      </div>
    )
  }

  // Morning done, evening not yet open — show what the day was set up around.
  const rows = [
    ['Approach',            entry.intention],
    ['What matters most',   entry.priorityText],
    ['Within your control', entry.inControl],
    ['Watch for',           entry.obstacle],
  ].filter(([, v]) => v && String(v).trim())

  return (
    <div className="max-w-xl mx-auto px-1 pt-8 pb-8 space-y-7">
      <div className="flex items-center gap-2.5">
        {isMorningWindow(hour)
          ? <Sun size={18} strokeWidth={2} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
          : <Check size={18} strokeWidth={2} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />}
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
          Your day has begun
        </p>
      </div>

      {rows.length === 0
        ? <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Your morning reflection is saved.</p>
        : <SummaryRows rows={rows} />}

      <button
        type="button"
        onClick={backToToday}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        Go to today
      </button>

      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
        Come back this evening to close the day.
      </p>
    </div>
  )
}
