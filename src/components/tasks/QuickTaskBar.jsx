// Component: QuickTaskBar
// Purpose: Zero-friction task entry bar at the top of TasksView.
//          Uses NLP parser for natural language input — "call dentist tomorrow high priority".
//          Keyboard shortcut: typing anywhere on the Tasks tab focuses this bar.
import { useState, useRef, useEffect, useMemo } from 'react'
import { parseNLTask } from '../../services/nlpParser'
import { classifyCapture } from '../../services/captureClassifier'
import { getTodayKey } from '../../utils/dateUtils'

const EXAMPLES = [
  'Call dentist tomorrow high priority',
  'Review report Friday work',
  'Buy groceries today personal',
  'Team meeting next Monday',
]

export default function QuickTaskBar({ tasks, onAdded }) {
  const [value,   setValue]   = useState('')
  const [hint,    setHint]    = useState(null)
  const [success, setSuccess] = useState(false)
  const [focused, setFocused] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)
  // Picked once per mount and stable thereafter. Reading the clock is
  // technically impure, but computing it in an effect instead would paint a
  // placeholder and then visibly swap it.
  // eslint-disable-next-line react-hooks/purity
  const placeholder = useMemo(() => EXAMPLES[Math.floor(Date.now() / 30000) % EXAMPLES.length], [])

  // Live-parse as user types to show what will be created
  useEffect(() => {
    if (!value.trim()) { setHint(null); return }
    const parsed = parseNLTask(value)
    if (parsed) setHint(parsed)
    else setHint({ title: value, date: getTodayKey(), priority: 'medium' })
  }, [value])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!value.trim()) return
    const text = value.trim()
    setSubmitting(true)
    let fields
    try {
      const result = await classifyCapture(text)
      fields = result.fields && result.fields.title ? result.fields : null
    } catch {
      fields = null
    }
    setSubmitting(false)
    if (!fields) {
      const parsed = parseNLTask(text)
      fields = parsed || { title: text, date: getTodayKey(), priority: 'medium', category: 'Personal' }
    }
    tasks.addTask(fields)
    setValue('')
    setHint(null)
    setSuccess(true)
    onAdded?.()
    setTimeout(() => setSuccess(false), 1500)
    inputRef.current?.focus()
  }

  const PRIORITY_TONE = { high: 'red', medium: 'amber', low: 'emerald' }

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor:     focused ? 'var(--accent-mid)' : 'var(--border)',
        boxShadow:       focused ? '0 0 0 3px var(--accent-light)' : 'var(--shadow-card)',
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Animated success / plus icon */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all"
            style={{
              backgroundColor: success ? 'var(--accent)' : 'var(--bg-secondary)',
              color:           success ? 'white' : 'var(--text-faint)',
            }}
          >
            {success ? '✓' : '+'}
          </div>

          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`Try: "${placeholder}"`}
            className="flex-1 text-sm bg-transparent outline-none min-h-[36px] disabled:opacity-60"
            style={{ color: 'var(--text)', caretColor: 'var(--accent)' }}
          />

          <button
            type="submit"
            disabled={!value.trim() || submitting}
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-white disabled:opacity-30 transition-all active:scale-95 flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {submitting ? '…' : 'Add'}
          </button>
        </div>

        {/* Live NLP preview — shown while typing */}
        {focused && hint && value.trim() && (
          <div
            className="px-4 pb-3 flex items-center gap-3 flex-wrap"
          >
            <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-faint)' }}>
              Will create:
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{hint.title}</span>
            {hint.date && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
              >
                📅 {hint.date}
              </span>
            )}
            {hint.priority && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize"
                style={{
                  backgroundColor: `var(--tone-${PRIORITY_TONE[hint.priority] || 'amber'}-bg)`,
                  color:           `var(--tone-${PRIORITY_TONE[hint.priority] || 'amber'}-text)`,
                }}
              >
                {hint.priority}
              </span>
            )}
            {hint.category && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-text)' }}
              >
                {hint.category}
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
