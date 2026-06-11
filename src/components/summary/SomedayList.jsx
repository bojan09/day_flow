// Component: SomedayList
// Purpose: "Someday" backlog — capture ideas and schedule them to a real date later
import { useState } from 'react'
import Card from '../ui/Card'
import { getTodayKey } from '../../utils/dateUtils'

export default function SomedayList({ someday, tasks }) {
  const [input, setInput]   = useState('')
  const [sched, setSched]   = useState({}) // itemId -> date

  const handleAdd = (e) => {
    e.preventDefault()
    someday.addItem(input)
    setInput('')
  }

  const handleSchedule = (id) => {
    const date = sched[id] || getTodayKey()
    const taskData = someday.scheduleItem(id, date)
    if (taskData) tasks.addTask(taskData)
  }

  if (someday.items.length === 0 && !input) return (
    <Card className="border-dashed [border-color:var(--border)] bg-transparent shadow-none">
      <p className="text-xs font-medium uppercase tracking-wider [color:var(--text-faint)] mb-2">📥 Someday List</p>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="Capture an idea for later..."
          className="flex-1 text-sm bg-transparent outline-none [color:var(--text)] [placeholder-color:var(--text-faint)]" />
        <button type="submit" disabled={!input.trim()}
          className="text-xs [color:var(--accent)] font-medium disabled:opacity-30 hover:[color:var(--accent)] transition-colors">
          Add
        </button>
      </form>
    </Card>
  )

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wider [color:var(--text-faint)] mb-3">📥 Someday List</p>
      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto scrollbar-hide">
        {someday.items.map(item => (
          <div key={item.id} className="flex items-center gap-2 group">
            <span className="flex-1 text-sm [color:var(--text)] truncate">{item.title}</span>
            <input
              type="date"
              value={sched[item.id] || ''}
              onChange={e => setSched(p => ({ ...p, [item.id]: e.target.value }))}
              className="text-[11px] border [border-color:var(--border)] rounded-lg px-1.5 py-1 outline-none focus:ring-1 focus:[box-shadow:0_0_0_3px_var(--accent-light)] [color:var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity w-28"
            />
            <button
              onClick={() => handleSchedule(item.id)}
              title="Schedule this task"
              className="text-[10px] px-2 py-1 rounded-full [background-color:var(--accent-light)] [color:var(--accent)] border [border-color:var(--accent-mid)] hover:[background-color:var(--accent-light)] transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
            >
              Schedule →
            </button>
            <button aria-label="Delete item" onClick={() => someday.removeItem(item.id)}
              className="[color:var(--text-faint)] hover:text-red-400 text-xs p-1 opacity-0 group-hover:opacity-100 transition-all">
              ✕
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2 border-t [border-color:var(--border-soft)] pt-3">
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="Add another idea..."
          className="flex-1 text-sm bg-transparent outline-none [color:var(--text)] [placeholder-color:var(--text-faint)]" />
        <button type="submit" disabled={!input.trim()}
          className="text-xs [color:var(--accent)] font-medium disabled:opacity-30 hover:[color:var(--accent)] transition-colors">
          Add
        </button>
      </form>
    </Card>
  )
}
