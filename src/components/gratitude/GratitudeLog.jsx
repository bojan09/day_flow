// Component: GratitudeLog
// Purpose: Daily 3-line gratitude journal — CSS variables, 44px+ inputs, auto-save on blur.
import { useState } from 'react'

export default function GratitudeLog({ gratitude }) {
  const [lines, setLines] = useState(gratitude.getTodayEntry())
  const [saved, setSaved]  = useState(lines.some(l => l.trim()))

  const setLine = (i, val) => {
    const next = [...lines]; next[i] = val
    setLines(next); setSaved(false)
  }

  const handleSave = () => { gratitude.setTodayEntry(lines); setSaved(true) }
  const filled = lines.filter(l => l.trim()).length

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          🙏 Gratitude
        </p>
        {saved && filled > 0 && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            {filled}/3 saved ✓
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-sm flex-shrink-0 w-4 text-center font-medium" style={{ color: 'var(--text-faint)' }}>
              {i + 1}.
            </span>
            <input
              value={line}
              onChange={e => setLine(i, e.target.value)}
              placeholder={['I am grateful for…', 'Something that made me smile…', 'A person I appreciate…'][i]}
              className="flex-1 text-sm rounded-xl px-3 outline-none border transition-all"
              style={{
                minHeight:       '44px',
                backgroundColor: 'var(--bg)',
                borderColor:     'var(--border)',
                color:           'var(--text)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-mid)'}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; handleSave() }}
            />
          </div>
        ))}
      </div>

      {!saved && lines.some(l => l.trim()) && (
        <button
          onClick={handleSave}
          className="mt-3 w-full py-2.5 rounded-xl text-white text-xs font-semibold transition-colors"
          style={{ backgroundColor: 'var(--accent)', minHeight: '44px' }}
        >
          Save Gratitude
        </button>
      )}
    </div>
  )
}
