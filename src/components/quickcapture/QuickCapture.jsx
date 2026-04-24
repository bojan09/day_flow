// Component: QuickCapture
// Purpose: Floating + button — smart routing: ! task, ? idea, " note, * habit.
//          CSS variables throughout — works in all themes.
import { useState, useEffect } from 'react'
import { parseNLTask } from '../../services/nlpParser'
import { getTodayKey } from '../../utils/dateUtils'

const PREFIXES = [
  { char: '!', label: 'Task',  hint: '!Call dentist tomorrow',    color: '#3B82F6' },
  { char: '?', label: 'Idea',  hint: '?App idea for runners',     color: '#F59E0B' },
  { char: '"', label: 'Note',  hint: '"Had a great insight',      color: '#3B6B4B' },
  { char: '*', label: 'Habit', hint: '*Morning run done',         color: '#7C3AED' },
]

const TYPE_META = {
  task:  { label: 'Task',  color: '#3B82F6', bg: '#EFF6FF' },
  idea:  { label: 'Idea',  color: '#F59E0B', bg: '#FFFBEB' },
  note:  { label: 'Note',  color: '#3B6B4B', bg: '#EEF4ED' },
  habit: { label: 'Habit', color: '#7C3AED', bg: '#F5F3FF' },
}

function detect(val) {
  if (val.startsWith('!')) return 'task'
  if (val.startsWith('?')) return 'idea'
  if (val.startsWith('"')) return 'note'
  if (val.startsWith('*')) return 'habit'
  return 'task'
}

export default function QuickCapture({ tasks, ideas, notes, habits }) {
  const [open,  setOpen]  = useState(false)
  const [input, setInput] = useState('')
  const [done,  setDone]  = useState(null)

  // Keyboard shortcut — press + anywhere
  useEffect(() => {
    const handler = (e) => {
      if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return
      if (e.key === '+' || (e.key === 'q' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const currentType = input.trim() ? detect(input) : null

  const handleSubmit = (e) => {
    e.preventDefault()
    const raw  = input.trim()
    if (!raw) return
    const type = detect(raw)
    const body = (type !== 'task' || raw.startsWith('!')) ? raw.slice(1).trim() || raw : raw

    if (type === 'task') {
      const parsed = parseNLTask(body)
      tasks.addTask(parsed || { title: body, date: getTodayKey(), priority: 'medium', category: 'Personal' })
    } else if (type === 'idea') {
      ideas.addIdea({ title: body, category: 'Other' })
    } else if (type === 'note') {
      notes.addNote({ title: body.slice(0, 40) || 'Quick note', content: body })
    } else if (type === 'habit') {
      const match = habits.habits.find(h => h.name.toLowerCase().includes(body.toLowerCase()))
      if (match) habits.toggleHabitDay(match.id)
    }

    setDone(type)
    setInput('')
    setTimeout(() => { setDone(null); setOpen(false) }, 1400)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full text-white text-2xl shadow-xl transition-all active:scale-95 hover:scale-105 flex items-center justify-center"
        style={{ backgroundColor: 'var(--accent)', boxShadow: '0 8px 24px rgba(59,107,75,0.35)' }}
        title="Quick capture (press +)"
        aria-label="Quick capture"
      >
        +
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          style={{ backgroundColor: 'var(--overlay)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:max-w-md rounded-3xl p-5 animate-slide-up sm:animate-scale-in"
            style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-modal)' }}
            onClick={e => e.stopPropagation()}
          >
            {done ? (
              /* Success state */
              <div className="flex flex-col items-center py-6">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white mb-3"
                  style={{ backgroundColor: TYPE_META[done].color }}
                >✓</div>
                <p className="text-sm font-semibold capitalize" style={{ color: 'var(--text)' }}>
                  {TYPE_META[done].label} captured!
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>
                  ⚡ Quick Capture
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Input */}
                  <div className="relative mb-3">
                    <input
                      autoFocus
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder='Start typing… ! task  ? idea  " note  * habit'
                      className="w-full text-base rounded-2xl px-4 py-3 outline-none border-2 transition-all"
                      style={{
                        backgroundColor: 'var(--bg)',
                        borderColor:     currentType ? TYPE_META[currentType].color : 'var(--border)',
                        color:           'var(--text)',
                      }}
                    />
                    {/* Type indicator */}
                    {currentType && (
                      <span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: TYPE_META[currentType].bg, color: TYPE_META[currentType].color }}
                      >
                        {TYPE_META[currentType].label}
                      </span>
                    )}
                  </div>

                  {/* Prefix quick-tap buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {PREFIXES.map(p => (
                      <button
                        key={p.char}
                        type="button"
                        onClick={() => setInput(p.char)}
                        className="flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all active:scale-95"
                        style={{
                          backgroundColor: input.startsWith(p.char) ? p.color + '18' : 'var(--bg-secondary)',
                          borderColor:     input.startsWith(p.char) ? p.color : 'var(--border)',
                        }}
                        title={p.hint}
                      >
                        <span className="text-base font-bold" style={{ color: p.color }}>{p.char}</span>
                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{p.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      Capture
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
