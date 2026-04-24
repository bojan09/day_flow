// Component: MiniHabitWidget
// Purpose: Compact habit check-in widget — shows today's habits as large tap circles.
//          Designed for quick access on the Today tab as a standalone card.
export default function MiniHabitWidget({ habits }) {
  const { habits: list, isHabitDone, toggleHabitDay, getTodayCompletion } = habits
  const today = new Date().toISOString().split('T')[0]
  const pct   = getTodayCompletion()

  if (list.length === 0) return null

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
          🔁 Quick Habits
        </p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color: pct === 100 ? 'var(--accent)' : 'var(--text-faint)' }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Habit circles — large tap targets */}
      <div className="flex flex-wrap gap-2">
        {list.map(h => {
          const done = isHabitDone(h.id, today)
          return (
            <button
              key={h.id}
              onClick={() => toggleHabitDay(h.id, today)}
              className="flex flex-col items-center gap-1 transition-all active:scale-90"
              style={{ minWidth: '52px' }}
              aria-pressed={done}
              title={h.name}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl border-2 transition-all duration-200"
                style={done
                  ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', boxShadow: '0 4px 12px rgba(59,107,75,0.25)' }
                  : { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }
                }
              >
                {done
                  ? <span className="text-white text-base">✓</span>
                  : <span style={{ filter: done ? 'none' : 'grayscale(0.3)' }}>{h.icon}</span>
                }
              </div>
              <span
                className="text-[9px] font-medium text-center leading-tight max-w-[52px] truncate"
                style={{ color: done ? 'var(--accent)' : 'var(--text-faint)' }}
              >
                {h.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* All done celebration */}
      {pct === 100 && (
        <p className="text-xs font-medium text-center mt-3" style={{ color: 'var(--accent)' }}>
          🎉 All habits done today!
        </p>
      )}
    </div>
  )
}
