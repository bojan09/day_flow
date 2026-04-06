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

  const PRIORITY_COLORS = { high: 'text-red-500', medium: 'text-amber-500', low: 'text-forest-500' }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            value={input}
            onChange={handleChange}
            placeholder='Try: "Call dentist tomorrow high priority"'
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-ink outline-none focus:ring-2 focus:ring-forest-200 focus:border-forest-400 placeholder-ink-faint/60 transition-all"
          />
        </div>
        <button type="submit" disabled={!input.trim()}
          className="px-4 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-40 transition-colors">
          Add
        </button>
      </form>

      {/* Parsed preview */}
      {preview && input.length > 3 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-parchment border border-stone-100 rounded-xl text-xs text-ink-muted">
          <span className="text-ink font-medium truncate max-w-[180px]">{preview.title}</span>
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
