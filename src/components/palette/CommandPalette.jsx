// Component: CommandPalette
// Purpose: Cmd/Ctrl+K overlay combining navigation, quick capture, and search
//          into one input. Reuses classifyCapture (existing AI service) for
//          capture, and ALL_MODULES (existing nav config) for navigation.
import { useState, useEffect, useRef } from 'react'
import { ALL_MODULES } from '../../hooks/useNavConfig'
import { parseCapture } from '../../services/captureParser'

export default function CommandPalette({ isOpen, onClose, onNavigate, onCapture }) {
  const [query, setQuery]     = useState('')
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

  const handleCapture = () => {
    if (!query.trim()) return
    const result = parseCapture(query.trim())
    onCapture(result)
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
            <button onClick={handleCapture}
              className="w-full text-left px-5 py-3 text-sm"
              style={{ color: 'var(--accent)' }}>
              {`✨ Capture "${query.trim()}"`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
