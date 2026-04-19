// Component: RoutineCard
// Purpose: Daily checklist card for one routine — step timer, edit trigger,
//          delete with confirmation. All colours from CSS variables.
import { useState, useEffect, useRef } from 'react'

const TIME_LABELS = {
  morning: '🌅 Morning',
  midday:  '☀️ Midday',
  evening: '🌙 Evening',
  anytime: '⏰ Anytime',
}

export default function RoutineCard({ routine, routines, onEdit, onDelete }) {
  const [timerStepId, setTimerStepId] = useState(null)
  const [secs,        setSecs]        = useState(0)
  const [running,     setRunning]     = useState(false)
  const [confirmDel,  setConfirmDel]  = useState(false)
  const intervalRef                   = useRef(null)
  const completion                    = routines.getCompletion(routine.id)
  const totalMins                     = routines.getTotalDuration(routine.id)

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) { clearInterval(intervalRef.current); setRunning(false); setTimerStepId(null); return 0 }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const startTimer = (step) => {
    setTimerStepId(step.id)
    setSecs((step.duration || 5) * 60)
    setRunning(true)
  }

  const stopTimer = () => { setRunning(false); setTimerStepId(null); setSecs(0) }

  const pad  = n => String(n).padStart(2, '0')
  const mins = Math.floor(secs / 60)
  const sec  = secs % 60

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl flex-shrink-0">{routine.emoji}</span>
          <div className="min-w-0">
            <p className="font-serif text-base leading-tight truncate" style={{ color: 'var(--text)' }}>
              {routine.name}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
              {TIME_LABELS[routine.time] || routine.time} · ~{totalMins} min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {/* Progress */}
          <div className="flex items-center gap-1.5">
            <div
              className="h-1.5 w-16 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--border)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${completion}%`, backgroundColor: 'var(--accent)' }}
              />
            </div>
            <span className="text-[11px] w-7 text-right" style={{ color: 'var(--text-faint)' }}>
              {completion}%
            </span>
          </div>

          {/* Edit */}
          <button
            onClick={() => onEdit(routine)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
            style={{ color: 'var(--text-faint)' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Edit routine"
          >
            ✏️
          </button>

          {/* Delete */}
          <button
            onClick={() => setConfirmDel(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
            style={{ color: 'var(--text-faint)' }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#fef2f2'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-faint)'
            }}
            title="Delete routine"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDel && (
        <div
          className="px-5 py-3 border-b flex items-center justify-between gap-3"
          style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}
        >
          <p className="text-sm text-red-700">Delete "{routine.name}"?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDel(false)}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
              style={{ borderColor: '#fca5a5', color: '#b91c1c', backgroundColor: 'transparent' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              onClick={() => { onDelete(routine.id); setConfirmDel(false) }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
              style={{ backgroundColor: '#ef4444' }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Active timer banner */}
      {timerStepId && (
        <div
          className="px-5 py-3 flex items-center justify-between border-b"
          style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
        >
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Timer running</p>
            <p className="font-serif text-2xl" style={{ color: 'var(--accent)' }}>
              {pad(mins)}:{pad(sec)}
            </p>
          </div>
          <button
            onClick={stopTimer}
            className="px-4 py-1.5 rounded-full text-white text-xs font-medium"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Stop
          </button>
        </div>
      )}

      {/* Steps */}
      <div className="px-5 py-3 space-y-2">
        {routine.steps.length === 0 ? (
          <p className="text-sm italic py-2 text-center" style={{ color: 'var(--text-faint)' }}>
            No steps yet — edit to add some.
          </p>
        ) : (
          routine.steps.map(step => {
            const done = routines.isStepDone(routine.id, step.id)
            return (
              <div
                key={step.id}
                className="flex items-center gap-3 py-1 group"
              >
                {/* Checkbox */}
                <button
                  onClick={() => routines.toggleStep(routine.id, step.id)}
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all"
                  style={done
                    ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                    : { borderColor: 'var(--border)' }
                  }
                  aria-label={done ? 'Mark undone' : 'Mark done'}
                >
                  {done && '✓'}
                </button>

                {/* Text */}
                <span
                  className="flex-1 text-sm transition-colors"
                  style={{
                    color:          done ? 'var(--text-faint)' : 'var(--text)',
                    textDecoration: done ? 'line-through'      : 'none',
                  }}
                >
                  {step.text}
                </span>

                {/* Duration + timer start */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    {step.duration}m
                  </span>
                  {!done && timerStepId !== step.id && (
                    <button
                      onClick={() => startTimer(step)}
                      className="text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors"
                      style={{
                        backgroundColor: 'var(--accent-light)',
                        borderColor:     'var(--accent-mid)',
                        color:           'var(--accent)',
                      }}
                    >
                      ▶ Start
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      {routine.steps.length > 0 && (
        <div
          className="px-5 pb-4 flex items-center justify-between"
        >
          <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
            {routine.steps.filter(s => routines.isStepDone(routine.id, s.id)).length}/{routine.steps.length} steps
          </span>
          {completion > 0 && (
            <button
              onClick={() => routines.resetRoutine(routine.id)}
              className="text-[11px] transition-colors"
              style={{ color: 'var(--text-faint)' }}
              onMouseOver={e => e.target.style.color = 'var(--text-muted)'}
              onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  )
}
