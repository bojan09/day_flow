// Component: BrainDump
// Purpose: Full-screen free-write that auto-parses lines into tasks, ideas, and notes
import { useState } from 'react'
import { parseNLTask } from '../../services/nlpParser'
import { getTodayKey } from '../../utils/dateUtils'

function classifyLine(line) {
  const l = line.toLowerCase().trim()
  if (!l) return null
  if (/\b(todo|task|call|email|send|buy|fix|finish|complete|schedule|book|remind)\b/.test(l)) return 'task'
  if (l.endsWith('?') || l.startsWith('why ') || l.startsWith('what if') || l.startsWith('how ')) return 'idea'
  return 'note'
}

const TYPE_STYLE = {
  task: 'bg-blue-50 border-blue-200 text-blue-700',
  idea: 'bg-amber-50 border-amber-200 text-amber-700',
  note: '[background-color:var(--accent-light)] [border-color:var(--accent-mid)] [color:var(--accent)]',
}
const TYPE_ICON = { task: '✅', idea: '💡', note: '📝' }

export default function BrainDump({ tasks, ideas, notes }) {
  const [text,     setText]     = useState('')
  const [parsed,   setParsed]   = useState([])
  const [step,     setStep]     = useState('write') // 'write' | 'review' | 'done'

  const handleParse = () => {
    const lines = text.split('\n').filter(l => l.trim())
    const items = lines.map(line => ({
      line,
      type: classifyLine(line) || 'note',
      selected: true,
    }))
    setParsed(items)
    setStep('review')
  }

  const toggleItem = (i)      => setParsed(p => p.map((item, idx) => idx === i ? { ...item, selected: !item.selected } : item))
  const changeType = (i, t)   => setParsed(p => p.map((item, idx) => idx === i ? { ...item, type: t } : item))

  const handleSave = () => {
    parsed.filter(p => p.selected).forEach(({ line, type }) => {
      if (type === 'task') {
        const t = parseNLTask(line)
        tasks.addTask(t || { title: line, date: getTodayKey(), priority: 'medium', category: 'Personal' })
      } else if (type === 'idea') {
        ideas.addIdea({ title: line, category: 'Other' })
      } else {
        notes.addNote({ title: line.slice(0, 40), content: line, tags: ['journal'] })
      }
    })
    setStep('done')
  }

  if (step === 'done') return (
    <div className="max-w-lg mx-auto pt-8 text-center space-y-4">
      <p className="text-5xl">🧠</p>
      <h2 className="font-serif text-2xl [color:var(--text)]">Brain dumped!</h2>
      <p className="[color:var(--text-muted)] text-sm">
        {parsed.filter(p => p.selected).length} items captured across tasks, ideas, and notes.
      </p>
      <button onClick={() => { setText(''); setParsed([]); setStep('write') }}
        className="px-5 py-2.5 rounded-full [background-color:var(--accent)] text-white text-sm font-medium hover:[background-color:var(--accent)] transition-colors">
        Start fresh
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto pt-2 space-y-4">
      {step === 'write' && (
        <>
          <div className="[background-color:var(--surface)] rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="px-5 py-3 border-b [border-color:var(--border-soft)] flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider [color:var(--text-faint)]">🧠 Brain Dump</p>
              <p className="text-xs [color:var(--text-faint)]">{text.split('\n').filter(l => l.trim()).length} lines</p>
            </div>
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Just write. One thought per line.\n\nExamples:\nCall dentist tomorrow\nWhat if I built a habit app?\nHad a great conversation with Sarah\nTodo: finish the report\nWhy am I always tired on Mondays?\nBuy groceries on the way home`}
              className="w-full px-5 py-4 text-sm [color:var(--text)] leading-relaxed bg-transparent outline-none resize-none min-h-72 [placeholder-color:var(--text-faint)] font-serif"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs [color:var(--text-faint)] italic">Everything will be auto-sorted into tasks, ideas, or notes</p>
            <button onClick={handleParse} disabled={!text.trim()}
              className="px-5 py-2.5 rounded-full [background-color:var(--accent)] text-white text-sm font-medium hover:[background-color:var(--accent)] disabled:opacity-40 transition-colors">
              Sort it out →
            </button>
          </div>
        </>
      )}

      {step === 'review' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium [color:var(--text)]">Review & confirm — {parsed.filter(p => p.selected).length} selected</p>
            <button onClick={() => setStep('write')} className="text-xs [color:var(--text-faint)] hover:[color:var(--text)] transition-colors">← Back</button>
          </div>
          <div className="space-y-2">
            {parsed.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${item.selected ? TYPE_STYLE[item.type] : '[background-color:var(--bg-secondary)] [border-color:var(--border-soft)] opacity-50'}`}>
                <button onClick={() => toggleItem(i)}
                  className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-[9px] transition-all ${
                    item.selected ? '[background-color:var(--surface)] border-current text-current' : '[border-color:var(--border)]'
                  }`}>{item.selected && '✓'}</button>
                <span className="text-sm flex-1 truncate">{item.line}</span>
                <div className="flex gap-1">
                  {['task','idea','note'].map(t => (
                    <button key={t} onClick={() => changeType(i, t)}
                      className={`text-base transition-transform ${item.type === t ? 'scale-125' : 'opacity-30 hover:opacity-70'}`}>
                      {TYPE_ICON[t]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={!parsed.some(p => p.selected)}
            className="w-full py-3 rounded-2xl [background-color:var(--accent)] text-white font-medium hover:[background-color:var(--accent)] disabled:opacity-40 transition-colors">
            Capture {parsed.filter(p => p.selected).length} items
          </button>
        </>
      )}
    </div>
  )
}
