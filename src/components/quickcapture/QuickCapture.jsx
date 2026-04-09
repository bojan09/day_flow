// Component: QuickCapture
// Purpose: Floating + button on all tabs — smart routing: ! = task, ? = idea, " = note, * = habit log
import { useState } from 'react'
import { parseNLTask } from '../../services/nlpParser'
import { getTodayKey } from '../../utils/dateUtils'

const PREFIXES = [
  { char: '!', label: 'Task',   color: 'text-blue-600',   hint: '!Call dentist tomorrow'   },
  { char: '?', label: 'Idea',   color: 'text-amber-600',  hint: '?App idea for runners'    },
  { char: '"', label: 'Note',   color: 'text-forest-600', hint: '"Had a great conversation'},
  { char: '*', label: 'Habit',  color: 'text-violet-600', hint: '*Morning run done'         },
]

export default function QuickCapture({ tasks, ideas, notes, habits, onTabChange }) {
  const [open,  setOpen]  = useState(false)
  const [input, setInput] = useState('')
  const [done,  setDone]  = useState(null)

  const detect = (val) => {
    if (val.startsWith('!')) return 'task'
    if (val.startsWith('?')) return 'idea'
    if (val.startsWith('"')) return 'note'
    if (val.startsWith('*')) return 'habit'
    return 'task' // default
  }

  const currentType = input ? detect(input) : null

  const handleSubmit = (e) => {
    e.preventDefault()
    const raw  = input.trim()
    if (!raw) return
    const type = detect(raw)
    const body = raw.slice(1).trim() || raw

    if (type === 'task') {
      const parsed = parseNLTask(body)
      tasks.addTask(parsed || { title: body, date: getTodayKey(), priority: 'medium', category: 'Personal' })
    } else if (type === 'idea') {
      ideas.addIdea({ title: body, category: 'Other' })
    } else if (type === 'note') {
      notes.addNote({ title: body.split('\n')[0].slice(0, 40) || 'Quick note', content: body })
    } else if (type === 'habit') {
      // Mark first matching habit as done today
      const match = habits.habits.find(h => h.name.toLowerCase().includes(body.toLowerCase()))
      if (match) habits.toggleHabitDay(match.id)
    }

    setDone(type)
    setInput('')
    setTimeout(() => { setDone(null); setOpen(false) }, 1200)
  }

  const TYPE_COLORS = { task: 'bg-blue-500', idea: 'bg-amber-500', note: 'bg-forest-500', habit: 'bg-violet-500' }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full bg-forest-500 text-white text-2xl shadow-xl hover:bg-forest-700 transition-all active:scale-95 flex items-center justify-center"
        title="Quick capture (or press +)"
      >
        +
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/30 backdrop-blur-sm px-4 pb-4 sm:pb-0"
          onClick={() => setOpen(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-3xl shadow-2xl p-5 animate-scale-in"
            onClick={e => e.stopPropagation()}>
            {done ? (
              <div className="flex flex-col items-center py-4">
                <div className={`w-12 h-12 rounded-full ${TYPE_COLORS[done]} text-white text-xl flex items-center justify-center mb-2`}>
                  ✓
                </div>
                <p className="text-sm font-medium text-ink capitalize">{done} captured!</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-3">⚡ Quick Capture</p>
                <form onSubmit={handleSubmit}>
                  <input
                    autoFocus
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Start typing… ! task  ? idea  &quot; note  * habit"
                    className="w-full text-base bg-parchment border border-stone-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-forest-200 text-ink placeholder-ink-faint/50 mb-3"
                  />

                  {/* Type hint */}
                  {currentType && (
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className={`text-xs font-semibold capitalize ${TYPE_COLORS[currentType].replace('bg-', 'text-')}`}>
                        → {currentType}
                      </span>
                    </div>
                  )}

                  {/* Prefix hints */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {PREFIXES.map(p => (
                      <button key={p.char} type="button"
                        onClick={() => setInput(p.char)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-left">
                        <span className={`text-xs font-bold ${p.color}`}>{p.char}</span>
                        <div>
                          <span className="text-xs font-medium text-ink">{p.label}</span>
                          <span className="text-[10px] text-ink-faint block">{p.hint}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-ink-muted hover:bg-stone-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={!input.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-40 transition-colors">
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
