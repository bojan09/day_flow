// Component: FocusMode
// Purpose: Pomodoro timer with session logging, history report, and task picker
import { useState, useEffect, useRef } from 'react'
import PomodoroReport from '../pomodoro/PomodoroReport'
import { usePomodoroHistory } from '../../hooks/usePomodoroHistory'

const MODES = [
  { id: 'focus', label: 'Focus',       mins: 25, color: '[color:var(--accent)]'  },
  { id: 'short', label: 'Short Break', mins: 5,  color: 'text-blue-500'   },
  { id: 'long',  label: 'Long Break',  mins: 15, color: 'text-violet-500' },
]

function pad(n) { return String(n).padStart(2, '0') }

// Local, in-tab notification for immediate session feedback while the app is open.
// Distinct from push notifications (services/pushNotificationService.js), which
// deliver reminders server-side even when the app is closed.
function notifyLocal(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const n = new Notification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico' })
  setTimeout(() => n.close(), 6000)
}

// pomodoroHistory is owned here rather than at the DashboardPage root: this is
// its only consumer, so hoisting it made every session load/subscribe for it
// even when the Focus tab was never opened.
export default function FocusMode({ tasks }) {
  const pomodoroHistory = usePomodoroHistory()
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
      notifyLocal('✅ Focus session done!', 'Take a well-earned break.')
    } else {
      notifyLocal('⏱ Break over!', 'Ready for another session?')
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
      <div className="flex gap-1 [background-color:var(--bg-secondary)] rounded-2xl p-1">
        {MODES.map(m => (
          <button key={m.id} onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === m.id ? '[background-color:var(--surface)] shadow-sm [color:var(--text)]' : '[color:var(--text-muted)] hover:[color:var(--text)]'
            }`}>{m.label}</button>
        ))}
      </div>

      {/* Ring */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
            <circle cx="110" cy="110" r="88" fill="none" stroke="var(--border)" strokeWidth="10"/>
            <circle cx="110" cy="110" r="88" fill="none"
              stroke={mode==='focus' ? 'var(--accent)' : mode==='short' ? '#3B82F6' : '#8B5CF6'}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${circ - dash} ${dash}`}
              style={{ transition: 'stroke-dasharray 1s linear' }}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-5xl [color:var(--text)] tracking-tight">
              {pad(Math.floor(secs/60))}:{pad(secs%60)}
            </span>
            <span className={`text-sm font-medium mt-1 ${current.color}`}>{current.label}</span>
            {todaySessions.length > 0 && (
              <span className="text-xs [color:var(--text-faint)] mt-1">{todaySessions.length} sessions · {todayMins}m today</span>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => { clearInterval(interval.current); setRunning(false); setSecs(current.mins * 60) }}
          className="w-10 h-10 rounded-full border [border-color:var(--border)] [color:var(--text-muted)] hover:[background-color:var(--bg-secondary)] flex items-center justify-center text-sm transition-colors">↺</button>
        <button onClick={() => setRunning(r => !r)}
          className={`w-20 h-20 rounded-full text-white font-semibold text-lg shadow-lg transition-all active:scale-95 ${
            running ? 'bg-terracotta-500 hover:bg-terracotta-700' : '[background-color:var(--accent)] hover:[background-color:var(--accent)]'
          }`}>{running ? '⏸' : '▶'}</button>
        <div className="w-10 h-10"/>
      </div>

      {/* Task picker */}
      {todayPending.length > 0 && (
        <div className="[background-color:var(--surface)] rounded-2xl p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-xs font-medium [color:var(--text-faint)] uppercase tracking-wider mb-2">Focusing on</p>
          <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-hide">
            {todayPending.map(t => (
              <button key={t.id} onClick={() => setTaskId(t.id)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                  taskId === t.id ? '[background-color:var(--accent)] text-white' : 'hover:[background-color:var(--bg-secondary)] [color:var(--text)]'
                }`}>
                <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-[10px] ${taskId === t.id ? 'border-white/50' : '[border-color:var(--border)]'}`}>
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
