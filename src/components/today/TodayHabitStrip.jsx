import { memo } from 'react'
// Component: TodayHabitStrip
// Purpose: Today's habit checklist — 44px+ tap rows, animated toggles, progress header.
function TodayHabitStrip({ habits }) {
  const { habits: list, isHabitDone, toggleHabitDay } = habits
  const doneCount = list.filter(h => isHabitDone(h.id)).length

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div
        className="px-5 pt-4 pb-3 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <h3 className="font-serif text-base" style={{ color: 'var(--text)' }}>Habits Today</h3>
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
          {doneCount}/{list.length}
        </span>
      </div>

      {list.length === 0 ? (
        <p className="px-5 py-5 text-sm italic text-center" style={{ color: 'var(--text-faint)' }}>
          Add habits in the Habits tab
        </p>
      ) : (
        <ul className="divide-y" style={{ borderColor: 'var(--border-soft)' }}>
          {list.map(h => {
            const done = isHabitDone(h.id)
            return (
              <li key={h.id}>
                <button
                  onClick={() => toggleHabitDay(h.id)}
                  className="hover-surface w-full flex items-center gap-3 px-5 transition-colors text-left"
                  style={{ minHeight: '52px' }}
                  aria-pressed={done}
                >
                  {/* Circle toggle */}
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs transition-all duration-200 ${done ? 'animate-bounce-check' : ''}`}
                    style={done
                      ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: 'white' }
                      : { borderColor: 'var(--border)' }
                    }
                  >
                    {done && '✓'}
                    {done && (
                      <span
                        className="absolute inset-0 rounded-full animate-ripple pointer-events-none"
                        style={{ backgroundColor: 'var(--accent)', opacity: 0.4 }}
                      />
                    )}
                  </span>

                  <span className="text-base flex-shrink-0">{h.icon}</span>

                  <span
                    className={`text-sm flex-1 transition-all ${done ? 'line-through' : ''}`}
                    style={{ color: done ? 'var(--text-faint)' : 'var(--text)' }}
                  >{h.name}</span>

                  {done && (
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--accent)' }}>✓</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default memo(TodayHabitStrip)
