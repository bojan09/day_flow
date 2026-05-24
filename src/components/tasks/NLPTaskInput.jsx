// Component: NLPTaskInput
// Purpose: Natural language task input — parses "call dentist tomorrow high priority work"
import { useState } from 'react'
import { parseNLTask } from '../../services/nlpParser'

export default function NLPTaskInput({ onAdd }) {
  const [input,   setInput]   = useState('')
  const [preview, setPreview] = useState(null)

  const handleChange = (e) => {
    const val = e.target.value
    setInput(val)
    if (val.length > 3) setPreview(parseNLTask(val))
    else setPreview(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const parsed = parseNLTask(input)
    if (parsed) onAdd(parsed)
    setInput('')
    setPreview(null)
  }

  const PRIORITY_COLORS = { high: 'text-red-500', medium: 'text-amber-500', low: '[color:var(--accent)]' }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={handleChange}
            placeholder='Try: "Call dentist tomorrow high priority"'
            className="w-full px-4 py-2.5 rounded-xl border [border-color:var(--border)] [background-color:var(--surface)] text-sm [color:var(--text)] outline-none focus:ring-2 focus:[box-shadow:0_0_0_3px_var(--accent-light)] focus:[border-color:var(--accent-mid)] [placeholder-color:var(--text-faint)] transition-all"
          />
        </div>
        <button type="submit" disabled={!input.trim()}
          className="px-4 py-2.5 rounded-xl [background-color:var(--accent)] text-white text-sm font-medium hover:[background-color:var(--accent)] disabled:opacity-40 transition-colors">
          Add
        </button>
      </form>

      {/* Parsed preview */}
      {preview && input.length > 3 && (
        <div className="flex items-center gap-2 px-3 py-1.5 [background-color:var(--bg)] border [border-color:var(--border-soft)] rounded-xl text-xs [color:var(--text-muted)]">
          <span className="[color:var(--text)] font-medium truncate max-w-[180px]">{preview.title}</span>
          <span className="text-stone-300">·</span>
          <span>{preview.date}</span>
          <span className="text-stone-300">·</span>
          <span className={PRIORITY_COLORS[preview.priority]}>{preview.priority}</span>
          <span className="text-stone-300">·</span>
          <span>{preview.category}</span>
          {preview.estimateMins && (
            <><span className="text-stone-300">·</span>
            <span>⏱ {preview.estimateMins}m</span></>
          )}
        </div>
      )}
    </div>
  )
}
