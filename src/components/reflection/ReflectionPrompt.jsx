// Component: ReflectionPrompt
// Purpose: The contextual entry into the Daily Reflection — "Begin your day"
//          in the morning, "Close your day" in the evening. This is how the
//          feature is discovered, which is why the spec asks for a contextual
//          entry rather than extra permanent navigation items.
//
// Shows nothing outside those windows, and nothing once the relevant half is
// done, so Today doesn't accumulate another permanent card.
import { Sunrise, Moon, ArrowRight } from 'lucide-react'
import { useReflections } from '../../hooks/useReflections'
import { isMorningWindow, isEveningWindow } from './ReflectionView'

export default function ReflectionPrompt({ onTabChange }) {
  const reflections = useReflections()
  const hour = new Date().getHours()

  const showMorning = isMorningWindow(hour) && !reflections.morningDone
  const showEvening = isEveningWindow(hour) && !reflections.eveningDone

  if (!showMorning && !showEvening) return null

  const morning = showMorning
  const Icon    = morning ? Sunrise : Moon

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
          {morning ? 'Begin your day' : 'Close your day'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--accent-text)', opacity: 0.85 }}>
          {morning
            ? 'A short reflection to set your intention.'
            : 'Look back on the day and carry something forward.'}
        </p>
      </div>
      <ArrowRight size={17} style={{ color: 'var(--accent-text)' }} aria-hidden="true" />
    </button>
  )
}
