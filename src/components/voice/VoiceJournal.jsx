// Component: VoiceJournal
// Purpose: Voice journaling using Web Speech API — records speech and saves as a note
import { useState, useRef, useEffect } from 'react'
import Card from '../ui/Card'

const isSupported = () =>
  'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

export default function VoiceJournal({ notes, xp }) {
  const [listening,  setListening]  = useState(false)
  const [transcript, setTranscript] = useState('')
  const [saved,      setSaved]      = useState(false)
  const [error,      setError]      = useState(null)
  const recogRef                    = useRef(null)

  useEffect(() => {
    if (!isSupported()) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r  = new SR()
    r.continuous     = true
    r.interimResults = true
    r.lang           = 'en-US'

    r.onresult = (e) => {
      let final = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
      }
      setTranscript(final)
    }

    r.onerror = (e) => {
      setError('Microphone error — check permissions.')
      setListening(false)
    }

    r.onend = () => setListening(false)
    recogRef.current = r
  }, [])

  const toggleListen = () => {
    if (!isSupported()) { setError('Speech recognition not supported in this browser.'); return }
    if (listening) {
      recogRef.current.stop()
      setListening(false)
    } else {
      setTranscript('')
      setError(null)
      recogRef.current.start()
      setListening(true)
    }
  }

  const handleSave = () => {
    if (!transcript.trim()) return
    const now = new Date()
    notes.addNote({
      title:   `Voice Journal · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      content: transcript.trim(),
      tags:    ['journal'],
    })
    xp.awardXP('NOTE_WRITTEN', 'voice journal')
    setSaved(true)
    setTranscript('')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-4">🎙 Voice Journal</p>

      {!isSupported() ? (
        <p className="text-sm text-ink-muted">Voice journaling requires Chrome or Edge.</p>
      ) : (
        <div className="space-y-4">
          {/* Big record button */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={toggleListen}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all active:scale-95 ${
                listening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-forest-500 text-white hover:bg-forest-700'
              }`}
            >
              {listening ? '⏹' : '🎙'}
            </button>
            <p className="text-xs text-ink-faint">
              {listening ? 'Listening… tap to stop' : 'Tap to start recording'}
            </p>
          </div>

          {/* Live transcript */}
          {(transcript || listening) && (
            <div className="bg-parchment border border-stone-200 rounded-xl p-4 min-h-20">
              <p className="text-sm text-ink leading-relaxed font-serif italic">
                {transcript || <span className="text-ink-faint">Speak now…</span>}
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          {transcript && !listening && (
            <div className="flex gap-2">
              <button
                onClick={() => setTranscript('')}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-ink-muted hover:bg-stone-50 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors"
              >
                {saved ? '✓ Saved!' : 'Save as Note'}
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
