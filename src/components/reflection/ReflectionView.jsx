// Component: ReflectionView
// Purpose: The single Daily Reflection destination. Decides which half of the
//          ritual to open — morning or evening — so the navigation only ever
//          needs one entry, per the spec's "do NOT automatically add multiple
//          permanent navigation items".
import MorningReview from './MorningReview'
import { useReflections } from '../../hooks/useReflections'
import { getTodayKey } from '../../utils/dateUtils'
import { Sun, Moon, Check } from 'lucide-react'

// Morning runs until noon; evening opens from 5pm. Between the two the user
// can still open either deliberately — this only picks the default.
export const isMorningWindow = (hour) => hour < 12
export const isEveningWindow = (hour) => hour >= 17

function Done({ Icon, title, body }) {
  return (
    <div className="max-w-xl mx-auto px-1 pt-10 pb-8 text-center space-y-4">
      <div
        className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
        style={{ backgroundColor: 'var(--accent-light)' }}
      >
        <Icon size={22} strokeWidth={2} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
      </div>
      <h2 className="font-serif text-2xl" style={{ color: 'var(--text)' }}>{title}</h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{body}</p>
    </div>
  )
}

export default function ReflectionView({ tasks, onTabChange }) {
  const dateKey     = getTodayKey()
  const reflections = useReflections(dateKey)
  const hour        = new Date().getHours()

  const backToToday = () => onTabChange?.('today')

  if (!reflections.morningDone) {
    return <MorningReview reflections={reflections} tasks={tasks} onClose={backToToday} dateKey={dateKey} />
  }

  // Evening flow lands in the next slice; until then the morning stands on its
  // own and says plainly what is and isn't here yet.
  if (isEveningWindow(hour)) {
    return (
      <Done
        Icon={Moon}
        title="Evening review is coming next"
        body="Your morning is saved. The evening half of the ritual isn't built yet."
      />
    )
  }

  // Morning summary (spec §10) — what you committed to, kept visible so the
  // principle doesn't disappear the moment the review closes.
  const { intention, priorityText, inControl, obstacle } = reflections.entry
  const rows = [
    ['Approach',           intention],
    ['What matters most',  priorityText],
    ['Within your control', inControl],
    ['Watch for',          obstacle],
  ].filter(([, value]) => value && String(value).trim())

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

      {rows.length === 0 && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Your morning reflection is saved.
        </p>
      )}

      <div className="space-y-5">
        {rows.map(([label, value]) => (
          <div key={label} className="space-y-1">
            <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>{label}</p>
            <p className="font-serif text-xl leading-snug" style={{ color: 'var(--text)' }}>{value}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={backToToday}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        Go to today
      </button>

      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
        The evening review lands in the next slice.
      </p>
    </div>
  )
}
