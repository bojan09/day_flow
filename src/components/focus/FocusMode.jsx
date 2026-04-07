// Component: FocusMode
// Purpose: Pomodoro timer with session logging, history report, and task picker
import { useState, useEffect, useRef } from 'react'
import PomodoroReport from '../pomodoro/PomodoroReport'
import { notifications } from '../../services/notificationService'

const MODES = [
  { id: 'focus', label: 'Focus',       mins: 25, color: 'text-forest-500'  },
  { id: 'short', label: 'Short Break', mins: 5,  color: 'text-blue-500'   },
  { id: 'long',  label: 'Long Break',  mins: 15, color: 'text-violet-500' },
]

function pad(n) { return String(n).padStart(2, '0') }

export default function FocusMode({ tasks, xp, pomodoroHistory }) {
  const [mode,    setMode]    = useState('focus')
  const [secs,    setSecs]    = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [taskId,  setTaskId]  = useState(null)
  const interval              = useRef(null)

  const current = MODES.find(m => m.id === mode)
  const total   = current.mins * 60
  const pct     = ((total - secs) / total) * 100
  const circ    = 2 * Math.PI * 88
  const dash    = ((100 - pct) / 100) * circ

  useEffect(() => {
    if (running) {
      interval.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) {
            clearInterval(interval.current)
            setRunning(false)
            handleComplete()
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(interval.current)
    }
    return () => clearInterval(interval.current)
  }, [running])

  const handleComplete = () => {
    if (mode === 'focus') {
      const focused = tasks.getTodayTasks().find(t => t.id === taskId)
      pomodoroHistory.logSession(current.mins, focused?.title || '')
      xp.awardXP('FOCUS_SESSION')
      notifications.send('✅ Focus session done!', 'Take a well-earned break.')
    } else {
      notifications.send('⏱ Break over!', 'Ready for another session?')
    }
  }

  const switchMode = (m) => {
    clearInterval(interval.current); setRunning(false)
    setMode(m.id); setSecs(m.mins * 60)
  }

  const todayPending = tasks.getTodayTasks().filter(t => !t.completed)
  const todaySessions = pomodoroHistory.getTodaySessions()
  const todayMins     = pomodoroHistory.getTodayMins()

  return (
    <div className="max-w-sm mx-auto space-y-5 pt-4">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-2xl p-1">
        {MODES.map(m => (
          <button key={m.id} onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === m.id ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink'
            }`}>{m.label}</button>
        ))}
      </div>

      {/* Ring */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
            <circle cx="110" cy="110" r="88" fill="none" stroke="#F1EDE8" strokeWidth="10"/>
            <circle cx="110" cy="110" r="88" fill="none"
              stroke={mode==='focus' ? '#3B6B4B' : mode==='short' ? '#3B82F6' : '#8B5CF6'}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${circ - dash} ${dash}`}
              style={{ transition: 'stroke-dasharray 1s linear' }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-5xl text-ink tracking-tight">
              {pad(Math.floor(secs/60))}:{pad(secs%60)}
            </span>
            <span className={`text-sm font-medium mt-1 ${current.color}`}>{current.label}</span>
            {todaySessions.length > 0 && (
              <span className="text-xs text-ink-faint mt-1">{todaySessions.length} sessions · {todayMins}m today</span>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => { clearInterval(interval.current); setRunning(false); setSecs(current.mins * 60) }}
          className="w-10 h-10 rounded-full border border-stone-200 text-ink-muted hover:bg-stone-50 flex items-center justify-center text-sm transition-colors">↺</button>
        <button onClick={() => setRunning(r => !r)}
          className={`w-20 h-20 rounded-full text-white font-semibold text-lg shadow-lg transition-all active:scale-95 ${
            running ? 'bg-terracotta-500 hover:bg-terracotta-700' : 'bg-forest-500 hover:bg-forest-700'
          }`}>{running ? '⏸' : '▶'}</button>
        <div className="w-10 h-10"/>
      </div>

      {/* Task picker */}
      {todayPending.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-4">
          <p className="text-xs font-medium text-ink-faint uppercase tracking-wider mb-2">Focusing on</p>
          <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-hide">
            {todayPending.map(t => (
              <button key={t.id} onClick={() => setTaskId(t.id)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                  taskId === t.id ? 'bg-forest-500 text-white' : 'hover:bg-stone-50 text-ink'
                }`}>
                <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-[10px] ${taskId === t.id ? 'border-white/50' : 'border-stone-300'}`}>
                  {taskId === t.id ? '●' : ''}
                </span>
                <span className="truncate">{t.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weekly report */}
      <PomodoroReport pomodoroHistory={pomodoroHistory} />
    </div>
  )
}
