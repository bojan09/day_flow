// Component: ReflectionPrompt
// Purpose: The reflection's home on Today — "Begin your day" in the morning,
//          "Close your day" in the evening, and a quiet confirmation once the
//          half is done.
//
// The reflection is a central part of the app rather than a side feature, so
// this stays visible all day instead of disappearing the moment it is used.
// Which half is on offer comes from reflectionSchedule, the same source the
// reminder notification and the Reflection view read, so they cannot disagree.
import { Sunrise, Moon, ArrowRight, Check } from 'lucide-react'
import { useReflections } from '../../hooks/useReflections'
import { useReflectionReminder } from '../../hooks/useReflectionReminder'
import { reflectionPhase, promptCopy } from '../../services/reflectionSchedule'

export default function ReflectionPrompt({ onTabChange }) {
  const reflections = useReflections()
  const { morningDone, eveningDone } = reflections

  // Also drives the once-per-half reminder while the app is open.
  const { due } = useReflectionReminder({ morningDone, eveningDone })

  const hour  = new Date().getHours()
  const phase = reflectionPhase(hour)

  // Nothing left to do today — say so briefly rather than vanishing.
  if (!due) {
    const bothDone = morningDone && eveningDone
    if (!morningDone && !eveningDone) return null   // middle of the night
    return (
      <button
        type="button"
        onClick={() => onTabChange?.('reflect')}
        className="w-full flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-left transition-all active:scale-[0.99]"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <Check size={17} strokeWidth={2} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
        <p className="flex-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {bothDone
            ? 'Your day is closed.'
            : 'Your day has begun — come back this evening to close it.'}
        </p>
        <ArrowRight size={15} style={{ color: 'var(--text-faint)' }} aria-hidden="true" />
      </button>
    )
  }

  const morning = due === 'morning'
  const Icon    = morning ? Sunrise : Moon
  const copy    = promptCopy(due)

  return (
    <button
      type="button"
      onClick={() => onTabChange?.('reflect')}
      className="w-full flex items-center gap-3.5 rounded-2xl border px-5 py-4 text-left transition-all active:scale-[0.99]"
      style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
    >
      <Icon size={20} strokeWidth={2} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-serif text-lg leading-snug" style={{ color: 'var(--accent-text)' }}>
          {copy.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--accent-text)', opacity: 0.85 }}>
          {morning && phase === 'midday'
            ? 'The day is underway — it is not too late to set an intention.'
            : copy.body}
        </p>
      </div>
      <ArrowRight size={17} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
    </button>
  )
}
