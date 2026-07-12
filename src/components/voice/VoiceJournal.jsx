// Component: VoiceJournal
// Purpose: Voice journaling — records speech, saves audio to Supabase Storage + note
import { useState, useRef, useEffect } from 'react'
import { uploadFile, BUCKETS } from '../../services/storageService'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../services/supabaseClient'

const isSupported = () => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
const canRecord   = () => !!(navigator.mediaDevices?.getUserMedia)

export default function VoiceJournal({ notes }) {
  const { user }                      = useAuth()
  const [listening,    setListening]  = useState(false)
  const [recording,    setRecording]  = useState(false)
  const [transcript,   setTranscript] = useState('')
  const [audioURL,     setAudioURL]   = useState(null)
  const [saved,        setSaved]      = useState(false)
  const [uploading,    setUploading]  = useState(false)
  const [error,        setError]      = useState(null)
  const recogRef                      = useRef(null)
  const mediaRef                      = useRef(null)
  const chunksRef                     = useRef([])

  useEffect(() => {
    if (!isSupported()) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r  = new SR()
    r.continuous = true; r.interimResults = true; r.lang = 'en-US'
    r.onresult = (e) => {
      let final = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
      }
      setTranscript(final)
    }
    r.onerror = () => { setError('Microphone error.'); setListening(false) }
    r.onend   = () => setListening(false)
    recogRef.current = r
  }, [])

  const startRecording = async () => {
    setTranscript(''); setAudioURL(null); setError(null)
    // Start speech recognition
    if (isSupported()) { recogRef.current?.start(); setListening(true) }
    // Start audio recording
    if (canRecord()) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mr     = new MediaRecorder(stream)
        chunksRef.current = []
        mr.ondataavailable = e => chunksRef.current.push(e.data)
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          setAudioURL(URL.createObjectURL(blob))
          stream.getTracks().forEach(t => t.stop())
        }
        mr.start(); mediaRef.current = mr; setRecording(true)
      } catch { /* audio recording not available, speech only */ }
    }
  }

  const stopRecording = () => {
    recogRef.current?.stop(); setListening(false)
    mediaRef.current?.stop(); setRecording(false)
  }

  const handleSave = async () => {
    if (!transcript.trim() && !audioURL) return
    setUploading(true)
    try {
      const now   = new Date()
      const title = `Voice Journal · ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      let audioPath = null

      // Upload audio to Supabase Storage if we have a recording and Supabase is set up
      if (audioURL && isSupabaseConfigured() && user) {
        const audioBlob = await fetch(audioURL).then(r => r.blob())
        const file      = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
        const result    = await uploadFile(BUCKETS.voice, user.id, file)
        audioPath       = result.path
      }

      notes.addNote({
        title,
        content:     transcript.trim(),
        tags:        ['journal'],
        attachments: audioPath ? [{ path: audioPath, name: title + '.webm', type: 'audio/webm', isVoice: true }] : [],
      })
      setSaved(true); setTranscript(''); setAudioURL(null)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError('Save failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const isActive = listening || recording

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
        🎙 Voice Journal
      </p>

      {!isSupported() ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Voice requires Chrome or Edge.</p>
      ) : saved ? (
        <div className="text-center py-4">
          <p className="text-2xl mb-2">✓</p>
          <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Saved to notes!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={isActive ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all active:scale-95 text-white ${isActive ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: isActive ? '#ef4444' : 'var(--accent)' }}
            >
              {isActive ? '⏹' : '🎙'}
            </button>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {isActive ? 'Recording… tap to stop' : 'Tap to start'}
            </p>
          </div>

          {(transcript || isActive) && (
            <div className="rounded-xl p-4 min-h-16 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
              <p className="text-sm leading-relaxed font-serif italic" style={{ color: 'var(--text)' }}>
                {transcript || <span style={{ color: 'var(--text-faint)' }}>Speak now…</span>}
              </p>
            </div>
          )}

          {audioURL && !isActive && (
            <audio src={audioURL} controls className="w-full rounded-xl" />
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          {(transcript || audioURL) && !isActive && (
            <div className="flex gap-2">
              <button onClick={() => { setTranscript(''); setAudioURL(null) }}
                className="flex-1 py-2.5 rounded-xl border text-sm transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                Discard
              </button>
              <button onClick={handleSave} disabled={uploading}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-60"
                style={{ backgroundColor: 'var(--accent)' }}>
                {uploading ? 'Saving…' : 'Save as Note'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
