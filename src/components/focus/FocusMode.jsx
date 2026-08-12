// Component: persisted, task-owned Focus Mode.
import { useEffect, useState } from 'react'
import PomodoroReport from '../pomodoro/PomodoroReport'
import FocusControls from './FocusControls'
import { useFocusSession } from '../../hooks/useFocusSession'

const pad = value => String(value).padStart(2, '0')

export default function FocusMode({ tasks, pomodoroHistory, selectedTaskId, onComplete }) {
  const focus = useFocusSession()
  const [taskId, setTaskId] = useState(selectedTaskId ?? '')
  const [duration, setDuration] = useState(25)
  const [customDuration, setCustomDuration] = useState('25')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (selectedTaskId && !focus.session) setTaskId(String(selectedTaskId))
  }, [focus.session, selectedTaskId])

  const selectedId = focus.session?.taskId ?? taskId
  const selectedTask = tasks.tasks.find(task => String(task.id) === String(selectedId))
  const availableTasks = tasks.tasks.filter(task => !task.completed)
  const totalSecs = focus.session?.durationSecs ?? (duration === 'custom' ? Number(customDuration) * 60 : duration * 60)
  const elapsedSecs = focus.session ? Math.max(0, focus.session.durationSecs - focus.remainingSecs) : 0
  const displaySecs = focus.session ? focus.remainingSecs : (Number.isFinite(totalSecs) ? totalSecs : 0)
  const pct = totalSecs > 0 ? Math.min(100, (elapsedSecs / totalSecs) * 100) : 0
  const circumference = 2 * Math.PI * 88

  const start = () => {
    const minutes = duration === 'custom' ? Number(customDuration) : duration
    if (!selectedTask) { setMessage('Choose an incomplete task first.'); return }
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) { setMessage('Choose a whole number from 1 to 240 minutes.'); return }
    focus.start(selectedTask.id, minutes)
    setMessage(`Focusing on ${selectedTask.title}.`)
  }

  const stop = () => {
    if (elapsedSecs >= 60 && !window.confirm('Stop this focus session? Your elapsed time will not be logged.')) return
    focus.stop()
    setMessage('Focus session stopped.')
  }

  const completeTask = () => {
    if (!selectedTask) { focus.clear(); return }
    if (!selectedTask.completed) tasks.toggleTask(selectedTask.id)
    const minutes = Math.max(1, Math.round(elapsedSecs / 60))
    pomodoroHistory.logSession(minutes, selectedTask.title, selectedTask.id)
    focus.clear()
    setMessage(`${selectedTask.title} completed after ${minutes} focused minute${minutes === 1 ? '' : 's'}.`)
    onComplete?.()
  }

  return (
    <div className="max-w-sm mx-auto space-y-5 pt-4">
      <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <label className="block text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          Focusing on
          <select disabled={!!focus.session} value={selectedId} onChange={event => setTaskId(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm normal-case" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            <option value="">Choose a task…</option>
            {availableTasks.map(task => <option key={task.id} value={task.id}>{task.title}</option>)}
          </select>
        </label>
        {selectedTask && <p className="font-serif text-xl mt-3" style={{ color: 'var(--text)' }}>{selectedTask.title}</p>}
      </div>

      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90" aria-hidden="true">
            <circle cx="110" cy="110" r="88" fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle cx="110" cy="110" r="88" fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${circumference}`} strokeDashoffset={`${circumference * (1 - pct / 100)}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-5xl" style={{ color: 'var(--text)' }}>{pad(Math.floor(displaySecs / 60))}:{pad(displaySecs % 60)}</span>
            <span className="text-sm mt-1" style={{ color: 'var(--accent)' }}>{focus.session?.status ?? 'Ready'}</span>
          </div>
        </div>
      </div>

      <FocusControls session={focus.session} duration={duration} customDuration={customDuration} onDuration={setDuration} onCustomDuration={setCustomDuration} onStart={start} onPause={focus.pause} onContinue={focus.continue} onStop={stop} onComplete={completeTask} />
      <p className="sr-only" aria-live="polite">{message}</p>

      <div className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
        {pomodoroHistory.getTodaySessions().length} sessions · {pomodoroHistory.getTodayMins()} focused minutes today
      </div>
      <PomodoroReport pomodoroHistory={pomodoroHistory} />
    </div>
  )
}
