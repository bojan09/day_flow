// Component: RoutineRunMode
// Purpose: Full-screen, distraction-free step-by-step execution of a routine.
//          `steps` = the routine's step array ({id, text, duration}). Advances
//          on tap/click; onFinish fires after the last step (caller decides
//          what "finishing" means — e.g. marking the routine's log entry done).
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function RoutineRunMode({ routine, steps, onFinish, onExit }) {
  const [idx, setIdx] = useState(0)
  const step = steps[idx]
  const isLast = idx === steps.length - 1

  const advance = () => isLast ? onFinish() : setIdx(i => i + 1)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onExit() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onExit])

  if (!step) return null

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-modal)] flex flex-col items-center justify-center text-center px-6"
      role="dialog" aria-modal="true"
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
    </div>,
    document.body
  )
}
