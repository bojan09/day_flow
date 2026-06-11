// Component: VoiceCommandBar
// Purpose: Floating mic button — always visible on all tabs, all devices.
//          Tap to activate voice commands: add task, log habit, note, idea.
//          Positioned above the QuickCapture (+) button.
import { useState, useRef, useEffect } from 'react'
import { parseNLTask } from '../../services/nlpParser'
import { getTodayKey } from '../../utils/dateUtils'

const isSupported = () =>
  typeof window !== 'undefined' &&
  ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

const COMMANDS = [
  { trigger: /^(add task|new task|task)\s+(.+)/i,          type: 'task'  },
  { trigger: /^(log habit|habit done|done habit)\s+(.+)/i, type: 'habit' },
  { trigger: /^(note|add note|quick note)\s+(.+)/i,        type: 'note'  },
  { trigger: /^(idea)\s+(.+)/i,                            type: 'idea'  },
]

const FEEDBACK_STYLES = {
  task:  { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', icon: '✅' },
  habit: { bg: '#EEF4ED', border: '#A7C9A0', text: '#2A4E36', icon: '🔁' },
  note:  { bg: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6', icon: '📝' },
  idea:  { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', icon: '💡' },
  error: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: '⚠️' },
}

function capitalize(str) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function parseCommand(text) {
  for (const cmd of COMMANDS) {
    const m = text.trim().match(cmd.trigger)
    if (m) return { type: cmd.type, body: capitalize(m[2].trim()) }
  }
  const t = text.trim()
  if (t.length > 2) return { type: 'task', body: capitalize(t) }
  return null
}

export default function VoiceCommandBar({ tasks, habits, notes, ideas }) {
  const [open,       setOpen]       = useState(false)
  const [listening,  setListening]  = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback,   setFeedback]   = useState(null)
  const [error,      setError]      = useState(null)
  const recogRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') { setOpen(false); stopListening() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  // Setup recognition
  useEffect(() => {
    if (!isSupported()) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r  = new SR()
    r.continuous      = false
    r.interimResults  = true
    r.lang            = 'en-US'
    r.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(text)
      if (e.results[e.results.length - 1].isFinal) executeCommand(text)
    }
    r.onend   = () => setListening(false)
    r.onerror = (e) => {
      setError(e.error === 'no-speech' ? 'No speech detected — try again' : `Mic error: ${e.error}`)
      setListening(false)
    }
    recogRef.current = r
  }, [tasks, habits, notes, ideas])

  const stopListening = () => {
    recogRef.current?.stop()
    setListening(false)
  }

  const executeCommand = (text) => {
    const parsed = parseCommand(text)
    if (!parsed) return
    if (parsed.type === 'task') {
      const nlp = parseNLTask(parsed.body)
      tasks.addTask(nlp || { title: parsed.body, date: getTodayKey(), priority: 'medium', category: 'Personal' })
      showFeedback('task', `Task added: "${parsed.body.slice(0, 45)}"`)
    } else if (parsed.type === 'habit') {
      const match = habits.habits.find(h => h.name.toLowerCase().includes(parsed.body.toLowerCase()))
      if (match) {
        habits.toggleHabitDay(match.id, getTodayKey())
        showFeedback('habit', `Habit logged: "${match.name}"`)
      } else {
        showFeedback('error', `No habit matching "${parsed.body}"`)
      }
    } else if (parsed.type === 'note') {
      notes.addNote({ title: parsed.body.slice(0, 40) || 'Voice note', content: parsed.body, tags: ['voice'] })
      showFeedback('note', `Note saved`)
    } else if (parsed.type === 'idea') {
      ideas.addIdea({ title: parsed.body, category: 'Other' })
      showFeedback('idea', `Idea captured`)
    }
    setTranscript('')
    setTimeout(() => { setOpen(false); setFeedback(null) }, 2000)
  }

  const showFeedback = (type, message) => setFeedback({ type, message })

  const toggleListen = () => {
    setError(null)
    if (listening) { stopListening(); return }
    recogRef.current?.start()
    setListening(true)
    setTranscript('')
    setFeedback(null)
  }

  if (!isSupported()) return null

  return (
    <>
      {/* Floating mic button — above the + QuickCapture button */}
      <button
        aria-label="Voice commands"
        onClick={() => { setOpen(v => !v); setError(null); setFeedback(null) }}
        className="fixed z-[var(--z-drawer)] w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg transition-all active:scale-90 hover:scale-105"
        style={{
          bottom:          'calc(env(safe-area-inset-bottom, 0px) + 8rem)',
          right:           '1rem',
          backgroundColor: listening ? '#EF4444' : 'var(--surface)',
          border:          `2px solid ${listening ? '#EF4444' : 'var(--accent-mid)'}`,
          color:           listening ? 'white' : 'var(--accent)',
          boxShadow:       'var(--shadow-modal)',
        }}
        title="Voice commands (say 'add task...', 'log habit...', 'note...')"
        aria-label="Voice command"
      >
        {listening ? '⏹' : '🎙'}
      </button>

      {/* Panel — appears above the mic button */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9990]"
            onClick={() => { setOpen(false); stopListening() }}
            aria-hidden="true"
          />

          {/* Card */}
          <div
            className="fixed z-[9991] w-80 rounded-2xl border p-4 animate-scale-in"
            style={{
              bottom:          'calc(env(safe-area-inset-bottom, 0px) + 12rem)',
              right:           '1rem',
              maxWidth:        'min(320px, calc(100vw - 2rem))',
              backgroundColor: 'var(--surface)',
              borderColor:     'var(--border)',
              boxShadow:       'var(--shadow-modal)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                🎙 Voice Commands
              </p>
              <button
                aria-label="Close voice commands"
                onClick={() => { setOpen(false); stopListening() }}
                className="text-sm w-6 h-6 flex items-center justify-center rounded-full transition-colors"
                style={{ color: 'var(--text-faint)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >✕</button>
            </div>

            {/* Big mic button */}
            <button
              onClick={toggleListen}
              className={`w-full py-4 rounded-2xl text-white text-lg font-semibold transition-all active:scale-95 ${listening ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: listening ? '#EF4444' : 'var(--accent)',
                boxShadow:       listening ? '0 0 0 8px rgba(239,68,68,0.15)' : 'none',
              }}
            >
              {listening ? '⏹ Stop' : '🎙 Tap to speak'}
            </button>

            {/* Live transcript */}
            {listening && (
              <p
                className="mt-3 text-sm font-serif italic text-center min-h-[20px]"
                style={{ color: transcript ? 'var(--text)' : 'var(--text-faint)' }}
              >
                {transcript || 'Listening…'}
              </p>
            )}

            {/* Feedback */}
            {feedback && (
              <div
                className="mt-3 text-xs px-3 py-2 rounded-xl font-medium flex items-center gap-2"
                style={{
                  backgroundColor: FEEDBACK_STYLES[feedback.type]?.bg,
                  borderColor:     FEEDBACK_STYLES[feedback.type]?.border,
                  color:           FEEDBACK_STYLES[feedback.type]?.text,
                  border:          '1px solid',
                }}
              >
                <span>{FEEDBACK_STYLES[feedback.type]?.icon}</span>
                {feedback.message}
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
            )}

            {/* Hints */}
            {!listening && !feedback && !error && (
              <div className="mt-3 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                  Try saying:
                </p>
                {[
                  '"Add task call dentist tomorrow"',
                  '"Log habit run"',
                  '"Note had a great idea"',
                  '"Idea app for dog owners"',
                ].map(h => (
                  <p key={h} className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{h}</p>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
