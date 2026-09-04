// Component: QuickPlannerWidget
// Purpose: Evening quick-planner — add tomorrow's top 3 tasks in seconds.
//          Surfaced in Today tab during evening context (after 5pm).
import { useState } from 'react'
import { format, addDays } from 'date-fns'


export default function QuickPlannerWidget({ tasks }) {
  const tomorrow     = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const tomorrowLabel = format(addDays(new Date(), 1), 'EEEE, MMM d')
  const tomorrowTasks = tasks.tasks.filter(t => t.date === tomorrow && !t.completed)

  const [inputs, setInputs] = useState(['', '', ''])
  const [saved,  setSaved]  = useState(false)

  const handleSave = () => {
    const filled = inputs.filter(v => v.trim())
    if (filled.length === 0) return
    filled.forEach(title => {
      tasks.addTask({ title, date: tomorrow, priority: 'medium', category: 'Personal' })
    })
    setSaved(true)
    setInputs(['', '', ''])
    setTimeout(() => setSaved(false), 2500)
  }

  const inputStyle = {
    backgroundColor: 'var(--bg)',
    borderColor:     'var(--border)',
    color:           'var(--text)',
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-faint)' }}>
          📅 Plan Tomorrow
        </p>
        <p className="font-serif text-base" style={{ color: 'var(--text)' }}>{tomorrowLabel}</p>
      </div>

      <div className="p-5 space-y-3">
        {/* Existing tomorrow tasks */}
        {tomorrowTasks.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {tomorrowTasks.map(t => (
              <div key={t.id} className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }}
                />
                <span className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{t.title}</span>
              </div>
            ))}
            <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
              {tomorrowTasks.length} task{tomorrowTasks.length !== 1 ? 's' : ''} already planned
            </p>
          </div>
        )}

        {saved ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-1">✅</p>
            <p className="text-sm font-medium" style={{ color: 'var(--accent-text)' }}>
              Tomorrow is planned!
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
              Rest easy tonight.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              What are your top 3 priorities for tomorrow?
            </p>
            {inputs.map((val, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className="text-xs font-bold w-5 text-center flex-shrink-0"
                  style={{ color: 'var(--text-faint)' }}
                >
                  {i + 1}.
                </span>
                <input
                  value={val}
                  onChange={e => setInputs(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                  placeholder={['Most important task…', 'Second priority…', 'Nice to have…'][i]}
                  className="flex-1 text-sm rounded-xl px-3 outline-none border"
                  style={{ ...inputStyle, minHeight: '44px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-mid)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && i < 2) {
                      e.preventDefault()
                      document.querySelectorAll('.plan-input')[i + 1]?.focus()
                    }
                  }}
                />
              </div>
            ))}

            <button
              onClick={handleSave}
              disabled={!inputs.some(v => v.trim())}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all active:scale-95 mt-1"
              style={{ backgroundColor: 'var(--accent)', minHeight: '48px' }}
            >
              Save tomorrow's plan
            </button>
          </>
        )}
      </div>
    </div>
  )
}
