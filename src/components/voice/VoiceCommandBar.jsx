// Component: VoiceCommandBar
// Purpose: Voice commands for quick actions — "add task call dentist tomorrow",
//          "log habit run", "note had a great idea". Uses Web Speech API + NLP parser.
import { useState, useRef, useEffect } from 'react'
import { parseNLTask } from '../../services/nlpParser'
import { getTodayKey } from '../../utils/dateUtils'

const isSupported = () =>
  'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

const COMMANDS = [
  { trigger: /^(add task|new task|task)\s+(.+)/i,    type: 'task'  },
  { trigger: /^(log habit|habit done|done habit)\s+(.+)/i, type: 'habit' },
  { trigger: /^(note|add note|quick note)\s+(.+)/i,  type: 'note'  },
  { trigger: /^(idea)\s+(.+)/i,                      type: 'idea'  },
]

function parseCommand(text) {
  for (const cmd of COMMANDS) {
    const m = text.trim().match(cmd.trigger)
    if (m) return { type: cmd.type, body: m[2].trim() }
  }
  // Default: treat as task
  if (text.trim().length > 2) return { type: 'task', body: text.trim() }
  return null
}

export default function VoiceCommandBar({ tasks, habits, notes, ideas }) {
  const [listening,  setListening]  = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback,   setFeedback]   = useState(null)   // { type, message }
  const [error,      setError]      = useState(null)
  const recogRef = useRef(null)

  useEffect(() => {
    if (!isSupported()) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r  = new SR()
    r.continuous      = false
    r.interimResults  = true
    r.lang            = 'en-US'

    r.onresult = (e) => {
      const text = Array.from(e.results)
        .map(r => r[0].transcript).join('')
      setTranscript(text)

      // Only act on final result
      if (e.results[e.results.length - 1].isFinal) {
        executeCommand(text)
      }
    }
    r.onend = () => setListening(false)
    r.onerror = (e) => {
      setError(e.error === 'no-speech' ? 'No speech detected' : `Error: ${e.error}`)
      setListening(false)
    }
    recogRef.current = r
  }, [tasks, habits, notes, ideas])

  const executeCommand = (text) => {
    const parsed = parseCommand(text)
    if (!parsed) return

    if (parsed.type === 'task') {
      const nlp = parseNLTask(parsed.body)
      tasks.addTask(nlp || { title: parsed.body, date: getTodayKey(), priority: 'medium', category: 'Personal' })
      setFeedback({ type: 'task', message: `Task added: "${parsed.body.slice(0, 40)}"` })
    } else if (parsed.type === 'habit') {
      const match = habits.habits.find(h =>
        h.name.toLowerCase().includes(parsed.body.toLowerCase())
      )
      if (match) {
        habits.toggleHabitDay(match.id, getTodayKey())
        setFeedback({ type: 'habit', message: `Habit logged: "${match.name}"` })
      } else {
        setFeedback({ type: 'error', message: `Habit not found: "${parsed.body}"` })
      }
    } else if (parsed.type === 'note') {
      notes.addNote({ title: parsed.body.slice(0, 40) || 'Voice note', content: parsed.body, tags: ['voice'] })
      setFeedback({ type: 'note', message: `Note saved: "${parsed.body.slice(0, 40)}"` })
    } else if (parsed.type === 'idea') {
      ideas.addIdea({ title: parsed.body, category: 'Other' })
      setFeedback({ type: 'idea', message: `Idea captured: "${parsed.body.slice(0, 40)}"` })
    }

    setTranscript('')
    setTimeout(() => setFeedback(null), 3000)
  }

  const toggleListen = () => {
    if (!recogRef.current) return
    setError(null)
    if (listening) {
      recogRef.current.stop()
      setListening(false)
    } else {
      recogRef.current.start()
      setListening(true)
      setTranscript('')
      setFeedback(null)
    }
  }

  if (!isSupported()) return null

  const FEEDBACK_COLORS = {
    task:  { bg: '#EFF6FF', text: '#1D4ED8' },
    habit: { bg: '#EEF4ED', text: '#2A4E36' },
    note:  { bg: '#F5F3FF', text: '#5B21B6' },
    idea:  { bg: '#FFFBEB', text: '#92400E' },
    error: { bg: '#FEF2F2', text: '#991B1B' },
  }

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>
        🎙 Voice Commands
      </p>

      <div className="flex items-center gap-4">
        {/* Mic button */}
        <button
          onClick={toggleListen}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white transition-all active:scale-90 flex-shrink-0 ${listening ? 'animate-pulse' : 'hover:scale-105'}`}
          style={{ backgroundColor: listening ? '#EF4444' : 'var(--accent)', boxShadow: listening ? '0 0 0 8px rgba(239,68,68,0.15)' : 'none' }}
          aria-label={listening ? 'Stop listening' : 'Start voice command'}
        >
          {listening ? '⏹' : '🎙'}
        </button>

        <div className="flex-1 min-w-0">
          {/* Live transcript */}
          {listening && (
            <p className="text-sm font-serif italic min-h-[20px]" style={{ color: transcript ? 'var(--text)' : 'var(--text-faint)' }}>
              {transcript || 'Listening…'}
            </p>
          )}

          {/* Feedback */}
          {feedback && !listening && (
            <div
              className="text-xs px-3 py-2 rounded-xl font-medium"
              style={{ backgroundColor: FEEDBACK_COLORS[feedback.type]?.bg, color: FEEDBACK_COLORS[feedback.type]?.text }}
            >
              ✓ {feedback.message}
            </div>
          )}

          {/* Hint */}
          {!listening && !feedback && (
            <div className="space-y-0.5">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Try saying:</p>
              <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>"Add task call dentist tomorrow"</p>
              <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>"Log habit run" · "Note had a great idea"</p>
            </div>
          )}

          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}
