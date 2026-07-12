// Component: RoutineRunMode
// Purpose: Full-screen, distraction-free step-by-step execution of a routine.
//          `steps` = the routine's step array ({id, text, duration}). Advances
//          on tap/click; onFinish fires after the last step (caller decides
//          what "finishing" means — e.g. marking the routine's log entry done).
import { useState } from 'react'

export default function RoutineRunMode({ routine, steps, onFinish, onExit }) {
  const [idx, setIdx] = useState(0)
  const step = steps[idx]
  const isLast = idx === steps.length - 1

  const advance = () => isLast ? onFinish() : setIdx(i => i + 1)

  if (!step) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-center px-6"
      style={{ backgroundColor: 'var(--bg)' }}>
      <button onClick={onExit} aria-label="Exit run mode"
        className="absolute top-6 right-6 text-sm" style={{ color: 'var(--text-faint)' }}>✕ Exit</button>
      <p className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-faint)' }}>
        {routine?.emoji} {routine?.name} · Step {idx + 1} of {steps.length}
      </p>
      <h2 className="font-serif text-3xl font-semibold mb-2" style={{ color: 'var(--text)' }}>{step.text}</h2>
      {step.duration && <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>{step.duration} min</p>}
      <button onClick={advance}
        className="px-8 py-3 rounded-full text-white font-medium"
        style={{ backgroundColor: 'var(--accent)' }}>
        {isLast ? 'Finish' : 'Next →'}
      </button>
    </div>
  )
}
