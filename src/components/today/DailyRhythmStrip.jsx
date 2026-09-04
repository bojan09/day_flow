import { memo } from 'react'
// Component: DailyRhythmStrip
// Purpose: Today's combined Habits + Routines card — 44px+ tap rows for habit
//          toggles, animated toggles, progress header, plus a compact
//          routine-progress row per routine with a jump-in link. Replaces the
//          old habits-only TodayHabitStrip: routines previously had no
//          presence on Today at all. Both sections use the same
//          habits/routines data hooks and CRUD/completion-tracking logic as
//          their full views — this widget only reads/toggles through them,
//          it does not duplicate any state.
const TIME_ORDER = { morning: 0, midday: 1, evening: 2, anytime: 3 }
const TIME_ICON   = { morning: '🌅', midday: '☀️', evening: '🌙', anytime: '⏰' }

function sortByTime(routines) {
  return [...routines].sort((a, b) => (TIME_ORDER[a.time] ?? 3) - (TIME_ORDER[b.time] ?? 3))
}

function DailyRhythmStrip({ habits, routines, onTabChange }) {
  const { habits: habitList, isHabitDone, toggleHabitDay } = habits
  const habitsDone = habitList.filter(h => isHabitDone(h.id)).length

  const routineList = routines ? sortByTime(routines.routines) : []

  const jumpToRhythm = () => onTabChange?.('rhythm')

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* ── Habits section ───────────────────────────────────────────────── */}
      <div
        className="px-5 pt-4 pb-3 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        <h3 className="font-serif text-base" style={{ color: 'var(--text)' }}>🔁 Habits</h3>
        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
          {habitsDone}/{habitList.length}
        </span>
      </div>

      {habitList.length === 0 ? (
        <p className="px-5 py-4 text-sm italic text-center" style={{ color: 'var(--text-faint)' }}>
          Add habits in Daily Rhythm
        </p>
      ) : (
        <ul className="divide-y" style={{ borderColor: 'var(--border-soft)' }}>
          {habitList.map(h => {
            const done = isHabitDone(h.id)
            return (
              <li key={h.id}>
                <button
                  onClick={() => toggleHabitDay(h.id)}
                  className="hover-surface w-full flex items-center gap-3 px-5 transition-colors text-left"
                  style={{ minHeight: '52px' }}
                  aria-pressed={done}
                >
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
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--accent-text)' }}>✓</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* ── Routines section ─────────────────────────────────────────────── */}
      {routines && (
        <>
          <div
            className="px-5 pt-4 pb-3 border-b border-t flex items-center justify-between"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            <h3 className="font-serif text-base" style={{ color: 'var(--text)' }}>🌅 Routines</h3>
            <button
              onClick={jumpToRhythm}
              className="hover-text text-[11px] font-medium"
              style={{ color: 'var(--accent-text)' }}
            >
              Run →
            </button>
          </div>

          {routineList.length === 0 ? (
            <p className="px-5 py-4 text-sm italic text-center" style={{ color: 'var(--text-faint)' }}>
              Add routines in Daily Rhythm
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--border-soft)' }}>
              {routineList.map(r => {
                const pct  = routines.getCompletion(r.id)
                const done = r.steps.filter(s => routines.isStepDone(r.id, s.id)).length
                return (
                  <li key={r.id}>
                    <button
                      onClick={jumpToRhythm}
                      className="hover-surface w-full flex items-center gap-3 px-5 py-2.5 transition-colors text-left"
                    >
                      <span className="text-base flex-shrink-0">{r.emoji}</span>
                      <span className="text-sm flex-1 truncate" style={{ color: 'var(--text)' }}>
                        {r.name}
                        <span className="ml-1.5 text-[10px]" style={{ color: 'var(--text-faint)' }}>
                          {TIME_ICON[r.time] || ''}
                        </span>
                      </span>
                      <div
                        className="h-1.5 w-12 rounded-full overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: 'var(--border)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: pct === 100 ? 'var(--accent)' : 'var(--accent-mid)' }}
                        />
                      </div>
                      <span className="text-[11px] flex-shrink-0 w-8 text-right" style={{ color: 'var(--text-faint)' }}>
                        {done}/{r.steps.length}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

export default memo(DailyRhythmStrip)
