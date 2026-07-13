// Component: CommandPalette
// Purpose: Cmd/Ctrl+K overlay combining navigation, quick capture, and search
//          into one input. Reuses classifyCapture (existing AI service) for
//          capture, and ALL_MODULES (existing nav config) for navigation.
import { useState, useEffect, useRef } from 'react'
import { ALL_MODULES } from '../../hooks/useNavConfig'
import { classifyCapture } from '../../services/captureClassifier'

export default function CommandPalette({ isOpen, onClose, onNavigate, onCapture }) {
  const [query, setQuery]     = useState('')
  const [capturing, setCapturing] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  if (!isOpen) return null

  const matches = ALL_MODULES.filter(m =>
    m.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleCapture = async () => {
    if (!query.trim()) return
    setCapturing(true)
    const result = await classifyCapture(query.trim())
    onCapture(result)
    setCapturing(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4"
      style={{ backgroundColor: 'var(--overlay)' }}
      onClick={onClose}
      onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-modal)' }}
        onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && matches.length === 0) handleCapture() }}
          placeholder="Jump to a view, or type to capture..."
          className="w-full px-5 py-4 text-base outline-none bg-transparent border-b"
          style={{ color: 'var(--text)', borderColor: 'var(--border-soft)' }}
          aria-label="Command palette"
        />
        <div className="max-h-80 overflow-y-auto">
          {matches.map(m => (
            <button key={m.id} onClick={() => { onNavigate(m.id); onClose() }}
              className="w-full text-left px-5 py-3 text-sm flex items-center gap-2 hover-surface"
              style={{ color: 'var(--text)' }}>
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
          {matches.length === 0 && query.trim() && (
            <button onClick={handleCapture} disabled={capturing}
              className="w-full text-left px-5 py-3 text-sm disabled:opacity-50"
              style={{ color: 'var(--accent)' }}>
              {capturing ? 'Capturing…' : `✨ Capture "${query.trim()}"`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
