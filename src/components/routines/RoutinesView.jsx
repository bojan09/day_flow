// Component: RoutinesView
// Purpose: Morning & evening routine checklists with step timer and progress
import { useState, useEffect, useRef } from 'react'
import Card from '../ui/Card'

function RoutineCard({ routine, routines }) {
  const [timerStep, setTimerStep] = useState(null)
  const [secs,      setSecs]      = useState(0)
  const [running,   setRunning]   = useState(false)
  const interval                  = useRef(null)
  const completion                = routines.getCompletion(routine.id)

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => setSecs(s => {
        if (s <= 1) { clearInterval(interval.current); setRunning(false); return 0 }
        return s - 1
      }), 1000)
    } else clearInterval(interval.current)
    return () => clearInterval(interval.current)
  }, [running])

  const startTimer = (step) => {
    setTimerStep(step.id); setSecs(step.duration * 60); setRunning(true)
  }
  const stopTimer = () => { setRunning(false); setTimerStep(null); setSecs(0) }

  const mins = Math.floor(secs / 60)
  const sec  = secs % 60
  const pad  = n => String(n).padStart(2, '0')

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{routine.emoji}</span>
          <span className="font-serif text-base text-ink">{routine.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-forest-500 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }} />
          </div>
          <span className="text-xs text-ink-faint">{completion}%</span>
        </div>
      </div>

      {/* Active timer */}
      {timerStep && (
        <div className="bg-forest-50 border border-forest-200 rounded-xl p-3 mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-forest-600 font-medium">Timer running</p>
            <p className="font-serif text-2xl text-forest-700">{pad(mins)}:{pad(sec)}</p>
          </div>
          <button onClick={stopTimer}
            className="px-3 py-1.5 rounded-full bg-forest-500 text-white text-xs font-medium hover:bg-forest-700 transition-colors">
            Stop
          </button>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {routine.steps.map(step => {
          const done = routines.isStepDone(routine.id, step.id)
          return (
            <div key={step.id} className="flex items-center gap-3 group">
              <button onClick={() => routines.toggleStep(routine.id, step.id)}
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all ${
                  done ? 'bg-forest-500 border-forest-500 text-white' : 'border-stone-300 hover:border-forest-400'
                }`}>{done && '✓'}</button>
              <span className={`flex-1 text-sm ${done ? 'line-through text-ink-faint' : 'text-ink'}`}>
                {step.text}
              </span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-ink-faint">{step.duration}m</span>
                {!done && (
                  <button onClick={() => startTimer(step)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-forest-50 text-forest-600 border border-forest-200 hover:bg-forest-100 transition-colors">
                    ▶ Start
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-ink-faint mt-3">
        Total: ~{routine.steps.reduce((s, step) => s + step.duration, 0)} min
      </p>
    </Card>
  )
}

export default function RoutinesView({ routines }) {
  const hour     = new Date().getHours()
  const isEvening = hour >= 18

  return (
    <div className="max-w-lg mx-auto space-y-4 pt-2">
      <p className="text-sm text-ink-muted">
        {isEvening ? 'Good evening — time for your wind-down routine.' : 'Good morning — start your day with intention.'}
      </p>
      {routines.routines
        .sort((a, b) => (isEvening ? b.time === 'evening' : a.time === 'morning') ? -1 : 1)
        .map(r => <RoutineCard key={r.id} routine={r} routines={routines} />)}
    </div>
  )
}
