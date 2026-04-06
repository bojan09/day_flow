// Component: GratitudeLog
// Purpose: Simple 3-line daily gratitude field with history peek
import { useState } from 'react'
import Card from '../ui/Card'

export default function GratitudeLog({ gratitude }) {
  const [lines, setLines] = useState(gratitude.getTodayEntry())
  const [saved, setSaved] = useState(lines.some(l => l.trim()))

  const setLine = (i, val) => {
    const next = [...lines]
    next[i] = val
    setLines(next)
    setSaved(false)
  }

  const handleSave = () => {
    gratitude.setTodayEntry(lines)
    setSaved(true)
  }

  const filled = lines.filter(l => l.trim()).length

  return (
    <Card className="bg-amber-50 border-amber-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-700">🙏 Gratitude</p>
        {saved && filled > 0 && (
          <span className="text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
            {filled}/3 saved
          </span>
        )}
      </div>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-amber-400 text-sm flex-shrink-0 w-4 text-center">{i + 1}.</span>
            <input
              value={line}
              onChange={e => setLine(i, e.target.value)}
              onBlur={handleSave}
              placeholder={['I am grateful for…', 'Something that made me smile…', 'A person I appreciate…'][i]}
              className="flex-1 text-sm bg-white/70 border border-amber-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-amber-300 text-ink placeholder-amber-300/70 transition-all"
            />
          </div>
        ))}
      </div>
      {!saved && lines.some(l => l.trim()) && (
        <button onClick={handleSave}
          className="mt-3 w-full py-2 rounded-xl bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors">
          Save Gratitude
        </button>
      )}
    </Card>
  )
}
