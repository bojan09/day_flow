// Component: RoutineEditor
// Purpose: Create or edit a routine — name, emoji, time-of-day, and step list.
//          Handles both new routines and editing existing ones.
import { useState } from 'react'
import { ROUTINE_TIMES, ROUTINE_EMOJIS } from '../../hooks/useRoutines'

const TIME_LABELS = {
  morning: '🌅 Morning',
  midday:  '☀️ Midday',
  evening: '🌙 Evening',
  anytime: '⏰ Anytime',
}

export default function RoutineEditor({ initial, onSubmit, onCancel }) {
  const [name,  setName]  = useState(initial?.name  || '')
  const [emoji, setEmoji] = useState(initial?.emoji || '🎯')
  const [time,  setTime]  = useState(initial?.time  || 'morning')
  const [steps, setSteps] = useState(
    initial?.steps
      ? initial.steps.map(s => ({ ...s }))   // deep copy so edits don't mutate original
      : []
  )
  const [newStepText,     setNewStepText]     = useState('')
  const [newStepDuration, setNewStepDuration] = useState('5')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // ── Step management ─────────────────────────────────────────────────────────

  const addStep = () => {
    const text = newStepText.trim()
    if (!text) return
    setSteps(prev => [
      ...prev,
      { id: Date.now().toString(), text, duration: Number(newStepDuration) || 5 },
    ])
    setNewStepText('')
    setNewStepDuration('5')
  }

  const updateStepText     = (id, text)     => setSteps(prev => prev.map(s => s.id === id ? { ...s, text }     : s))
  const updateStepDuration = (id, duration) => setSteps(prev => prev.map(s => s.id === id ? { ...s, duration } : s))
  const removeStep         = (id)           => setSteps(prev => prev.filter(s => s.id !== id))

  const moveStep = (idx, dir) => {
    const next = [...steps]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    setSteps(next)
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), emoji, time, steps })
  }

  const totalMins = steps.reduce((s, step) => s + (Number(step.duration) || 0), 0)

  const inputStyle = {
    backgroundColor: 'var(--bg)',
    borderColor:     'var(--border)',
    color:           'var(--text)',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Name + Emoji row */}
      <div className="flex gap-3">
        {/* Emoji picker */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(v => !v)}
            className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all"
            style={{
              borderColor:     showEmojiPicker ? 'var(--accent)' : 'var(--border)',
              backgroundColor: 'var(--bg)',
            }}
            aria-label="Pick emoji"
          >
            {emoji}
          </button>

          {showEmojiPicker && (
            <div
              className="absolute top-14 left-0 z-20 rounded-2xl border p-3 grid grid-cols-6 gap-1.5 shadow-lg"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-modal)' }}
            >
              {ROUTINE_EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => { setEmoji(e); setShowEmojiPicker(false) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors hover:scale-110"
                  style={{
                    backgroundColor: e === emoji ? 'var(--accent-light)' : 'transparent',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="flex-1">
          <label className="text-xs font-medium uppercase tracking-wide block mb-1.5"
            style={{ color: 'var(--text-muted)' }}>
            Routine name *
          </label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Morning Power-Up"
            className="input-base w-full"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Time of day */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wide block mb-2"
          style={{ color: 'var(--text-muted)' }}>
          When
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ROUTINE_TIMES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTime(t)}
              className="py-2 rounded-xl text-sm font-medium transition-all border"
              style={time === t
                ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                : { borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'transparent' }
              }
            >
              {TIME_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}>
            Steps
          </label>
          {steps.length > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
              ~{totalMins} min total
            </span>
          )}
        </div>

        {/* Existing steps */}
        {steps.length > 0 && (
          <div className="space-y-2 mb-3">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-center gap-2 p-2.5 rounded-xl border"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                {/* Reorder arrows */}
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => moveStep(idx, -1)}
                    disabled={idx === 0}
                    className="text-[10px] leading-none disabled:opacity-20 transition-opacity"
                    style={{ color: 'var(--text-faint)' }}
                  >▲</button>
                  <button
                    type="button"
                    onClick={() => moveStep(idx, 1)}
                    disabled={idx === steps.length - 1}
                    className="text-[10px] leading-none disabled:opacity-20 transition-opacity"
                    style={{ color: 'var(--text-faint)' }}
                  >▼</button>
                </div>

                {/* Step text */}
                <input
                  value={step.text}
                  onChange={e => updateStepText(step.id, e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none min-w-0"
                  style={{ color: 'var(--text)' }}
                />

                {/* Duration */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={step.duration}
                    onChange={e => updateStepDuration(step.id, Number(e.target.value))}
                    className="w-10 text-xs text-center px-1 py-1 rounded-lg border outline-none"
                    style={inputStyle}
                  />
                  <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>m</span>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeStep(step.id)}
                  className="hover-danger text-xs flex-shrink-0 transition-colors w-5 text-center"
                  style={{ color: 'var(--text-faint)' }}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Add step */}
        <div className="flex gap-2">
          <input
            value={newStepText}
            onChange={e => setNewStepText(e.target.value)}
            placeholder="Add a step…"
            className="input-base flex-1 text-sm"
            style={inputStyle}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addStep() } }}
          />
          <input
            type="number"
            min="1"
            max="120"
            value={newStepDuration}
            onChange={e => setNewStepDuration(e.target.value)}
            className="w-14 text-sm text-center px-2 py-2.5 rounded-xl border outline-none"
            style={inputStyle}
            title="Duration in minutes"
          />
          <span className="flex items-center text-xs flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
            min
          </span>
          <button
            type="button"
            onClick={addStep}
            disabled={!newStepText.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40 flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="hover-surface flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {initial ? 'Save changes' : 'Create routine'}
        </button>
      </div>
    </form>
  )
}
