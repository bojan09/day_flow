// Component: ActiveWorkoutMode
// Purpose: A focused, full-screen workout runner — spec §28: "Strongly
//          consider creating a focused ACTIVE WORKOUT experience. Once a
//          workout starts, reduce unrelated application UI... The user
//          should not constantly return to the workout overview."
//
// Covers the whole viewport at the highest z-layer (same token as Modal),
// which hides the sidebar/bottom nav entirely rather than just being another
// tab's content — that distinction is the point of this component existing.
//
// Set completion is written through workouts.toggleSet on every tap, same as
// the card's inline toggles, so it survives a reload mid-workout. Only the
// navigation state (which exercise you're on, the rest countdown) is
// component-local and resets on reload — an accepted tradeoff for a session
// that normally runs 20-60 minutes, not the many-hour case fasting had to
// solve for.
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'

const REST_SECONDS = 60
const FEELINGS = ['Easy', 'Good', 'Hard']

function pad(n) { return String(n).padStart(2, '0') }

export default function ActiveWorkoutMode({ session, workouts, onClose }) {
  const exercises = session.exercises || []
  const [exIndex, setExIndex] = useState(0)
  const [resting, setResting] = useState(false)
  const [restLeft, setRestLeft] = useState(REST_SECONDS)
  const [finished, setFinished] = useState(false)
  const [feeling, setFeeling] = useState('')
  const [durationMins, setDurationMins] = useState(0)
  const startedAtRef = useRef(null)
  const restInterval = useRef(null)

  // Start the clock as a side effect, not during render — Date.now() read at
  // render time would be impure and could produce different values across
  // React's speculative re-renders.
  useEffect(() => { startedAtRef.current = Date.now() }, [])

  const exercise = exercises[exIndex] ?? null
  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0)
  const doneSets  = exercises.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0)
  const allSetsDone = totalSets > 0 && doneSets === totalSets

  // Rest countdown — starts when a set is marked done, cancels on exit or exercise change.
  useEffect(() => {
    if (!resting) return
    restInterval.current = setInterval(() => {
      setRestLeft(s => {
        if (s <= 1) {
          clearInterval(restInterval.current)
          setResting(false)
          return REST_SECONDS
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(restInterval.current)
  }, [resting])

  useEffect(() => {
    setResting(false)
    setRestLeft(REST_SECONDS)
  }, [exIndex])

  useEffect(() => () => clearInterval(restInterval.current), [])

  const handleToggleSet = (setId, wasDone) => {
    workouts.toggleSet(session.id, exercise.id, setId)
    // Only start the rest countdown when completing a set, not un-completing one.
    if (!wasDone) {
      setRestLeft(REST_SECONDS)
      setResting(true)
    }
  }

  const goNext = () => setExIndex(i => Math.min(i + 1, exercises.length - 1))
  const goPrev = () => setExIndex(i => Math.max(i - 1, 0))

  // Duration is computed here, in an event handler — never read a ref or call
  // Date.now() during render.
  const handleFinish = () => {
    clearInterval(restInterval.current)
    const started = startedAtRef.current ?? Date.now()
    setDurationMins(Math.max(1, Math.round((Date.now() - started) / 60000)))
    setFinished(true)
  }

  const handleDone = () => {
    workouts.updateSession(session.id, {
      completed: true,
      durationMins,
      feeling: feeling || session.feeling || '',
    })
    onClose()
  }

  // ── Completion screen — spec §30: lightweight, not gamified ───────────────
  // Portaled to document.body, same as Modal.jsx and for the same reason:
  // PageTransition sets an inline `transform` on the route wrapper for its
  // page-enter animation, and any transformed ancestor creates a new
  // containing block for `position: fixed` descendants — without the portal
  // this "fixed inset-0" resolves against that wrapper's box instead of the
  // real viewport, so the bottom nav and top bar showed through on top of it.
  if (finished) {
    return createPortal(
      <div
        className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <div className="w-full max-w-sm text-center space-y-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-text)' }}>
              Workout complete
            </p>
            <p className="font-serif text-2xl" style={{ color: 'var(--text)' }}>{session.title}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'minutes',   value: durationMins },
              { label: 'exercises', value: exercises.length },
              { label: 'sets',      value: totalSets },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
                <p className="font-serif text-2xl" style={{ color: 'var(--text)' }}>{stat.value}</p>
                <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-faint)' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>How did it feel? (optional)</p>
            <div className="flex justify-center gap-2">
              {FEELINGS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFeeling(v => v === f ? '' : f)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                  style={feeling === f
                    ? { backgroundColor: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
                    : { color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleDone}
            className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Done
          </button>
        </div>
      </div>,
      document.body,
    )
  }

  // No exercises to run — nothing sensible to show, so don't trap the user.
  if (!exercise) {
    return createPortal(
      <div
        className="fixed inset-0 z-[var(--z-modal)] flex flex-col items-center justify-center gap-4 p-4"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This workout has no exercises yet.</p>
        <button type="button" onClick={onClose} className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
          Close
        </button>
      </div>,
      document.body,
    )
  }

  // ── Active exercise screen — spec §28-29 ──────────────────────────────────
  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex flex-col"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Header — overall progress only, nothing else competing for attention */}
      <div className="flex-shrink-0 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            {session.title}
          </p>
          <button type="button" onClick={onClose} aria-label="Exit workout" className="tap-target -mr-1.5" style={{ color: 'var(--text-faint)' }}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%`, backgroundColor: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* Body — the current exercise, and nothing else */}
      <div className="flex-1 overflow-y-auto px-5 flex flex-col items-center justify-center text-center space-y-6 pb-6">
        <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
          Exercise {exIndex + 1} of {exercises.length}
        </p>

        <h1 className="font-serif text-3xl leading-tight" style={{ color: 'var(--text)' }}>
          {exercise.name}
        </h1>

        {exercise.sets.length > 0 && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {exercise.sets.length} × {exercise.sets[0].reps || '—'}
            {exercise.sets[0].weight ? ` @ ${exercise.sets[0].weight}${exercise.sets[0].unit || 'kg'}` : ''}
          </p>
        )}

        {/* Sets — tap to mark done, the same write path as the card view */}
        <div className="flex flex-col gap-2 w-full max-w-xs">
          {exercise.sets.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleToggleSet(s.id, s.done)}
              className="flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.98]"
              style={s.done
                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                : { backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <span>Set {i + 1}{s.reps ? ` · ${s.reps} reps` : ''}{s.weight ? ` · ${s.weight}${s.unit || 'kg'}` : ''}</span>
              {s.done ? <Check size={16} aria-hidden="true" /> : <span className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--border)' }} />}
            </button>
          ))}
        </div>

        {/* Rest — only shown while actively resting, never as a fixture */}
        {resting && (
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Rest</p>
            <p className="font-serif text-4xl tabular-nums" style={{ color: 'var(--accent-text)' }}>
              {pad(Math.floor(restLeft / 60))}:{pad(restLeft % 60)}
            </p>
            <button
              type="button"
              onClick={() => { setResting(false); clearInterval(restInterval.current) }}
              className="text-xs font-medium underline underline-offset-2"
              style={{ color: 'var(--text-faint)' }}
            >
              Skip rest
            </button>
          </div>
        )}

        {allSetsDone && (
          <button
            type="button"
            onClick={handleFinish}
            className="w-full max-w-xs py-3 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Finish workout
          </button>
        )}
      </div>

      {/* Footer nav — Previous / Next, plus a quiet way to finish early */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={exIndex === 0}
          className="flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-medium border transition-all disabled:opacity-30"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={15} aria-hidden="true" /> Previous
        </button>

        <button
          type="button"
          onClick={exIndex === exercises.length - 1 ? handleFinish : goNext}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {exIndex === exercises.length - 1 ? 'Finish' : 'Next exercise'}
          {exIndex !== exercises.length - 1 && <ChevronRight size={15} aria-hidden="true" />}
        </button>
      </div>
    </div>,
    document.body,
  )
}
