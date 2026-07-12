// Component: SmartStreakBoard
// Purpose: Upgraded streak system — consistency score, recovery streaks, 4-week heatmap.
//          "Recovery streak" rewards getting back on track after a gap.
import { useMemo } from 'react'
import { subDays, format } from 'date-fns'
import { getDateKey } from '../../utils/dateUtils'

function ConsistencyRing({ pct, label }) {
  const R    = 32
  const circ = 2 * Math.PI * R
  const dash = (pct / 100) * circ
  const color = pct >= 80 ? '#3B6B4B' : pct >= 50 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
          <circle cx="40" cy="40" r={R} fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle cx="40" cy="40" r={R} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition: 'stroke-dasharray 0.7s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-xl font-bold" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <p className="text-xs font-medium text-center" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

export default function SmartStreakBoard({ habits }) {
  if (!habits?.habits) return null
  const data = useMemo(() => {
    const last28 = Array.from({ length: 28 }, (_, i) => {
      const d = subDays(new Date(), 27 - i)
      return {
        dateKey: getDateKey(d),
        label:   format(d, 'dd'),
        dow:     format(d, 'EEE'),
        active:  habits.habits.some(h => habits.isHabitDone(h.id, getDateKey(d))),
      }
    })

    // Consistency score: % of last 28 days with at least 1 habit done
    const activeDays   = last28.filter(d => d.active).length
    const consistency  = Math.round((activeDays / 28) * 100)

    // Per-habit streaks
    const habitStreaks = habits.habits.map(h => ({
      id:             h.id,
      name:           h.name,
      icon:           h.icon,
      streak:         habits.getStreak(h.id),
      weeklyCount:    habits.getWeeklyCount(h.id),
    })).sort((a, b) => b.streak - a.streak)

    // Recovery streak — days in a row after the last gap
    let recoveryStreak = 0
    let foundGap = false
    for (let i = last28.length - 1; i >= 0; i--) {
      if (!foundGap && last28[i].active) {
        recoveryStreak++
      } else if (!foundGap && !last28[i].active) {
        foundGap = true
      } else if (foundGap && last28[i].active) {
        // Before the gap — don't count
        break
      }
    }

    // Best ever streak
    const maxStreak = habits.getMaxStreak()

    return { last28, consistency, activeDays, habitStreaks, recoveryStreak, maxStreak }
  }, [habits])

  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
        🔥 Streak Intelligence
      </p>

      {/* Consistency rings */}
      <div className="flex justify-around mb-5">
        <ConsistencyRing pct={data.consistency} label="28-day consistency" />
        <div className="flex flex-col items-center gap-1.5 justify-center">
          <p className="font-serif text-3xl" style={{ color: 'var(--accent)' }}>{data.maxStreak}</p>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Best streak</p>
        </div>
        <div className="flex flex-col items-center gap-1.5 justify-center">
          <p className="font-serif text-3xl" style={{ color: data.recoveryStreak > 0 ? '#F59E0B' : 'var(--text-faint)' }}>
            {data.recoveryStreak}
          </p>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Recovery streak</p>
          {data.recoveryStreak > 0 && (
            <p className="text-[10px] text-center" style={{ color: '#92400E' }}>Back on track! 💪</p>
          )}
        </div>
      </div>

      {/* 28-day heatmap */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>
          Last 28 days
        </p>
        <div className="grid grid-cols-7 gap-1">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} className="text-center text-[9px] mb-0.5" style={{ color: 'var(--text-faint)' }}>{d}</div>
          ))}
          {/* Offset for starting day of week */}
          {Array.from({ length: (new Date(data.last28[0].dateKey).getDay() + 6) % 7 }, (_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {data.last28.map(d => (
            <div
              key={d.dateKey}
              className="aspect-square rounded-sm transition-all duration-300"
              style={{
                backgroundColor: d.active ? 'var(--accent)' : 'var(--border)',
                opacity:         d.active ? 1 : 0.4,
              }}
              title={`${d.dateKey}: ${d.active ? 'Active' : 'Missed'}`}
            />
          ))}
        </div>
      </div>

      {/* Per-habit streaks */}
      {data.habitStreaks.length > 0 && (
        <div className="space-y-2 border-t pt-3" style={{ borderColor: 'var(--border-soft)' }}>
          {data.habitStreaks.slice(0, 5).map(h => (
            <div key={h.id} className="flex items-center gap-2.5">
              <span className="text-base w-5 flex-shrink-0 text-center">{h.icon}</span>
              <span className="text-xs flex-1 truncate" style={{ color: 'var(--text)' }}>{h.name}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                🔥 {h.streak}
              </span>
              <span className="text-[10px] w-8 text-right" style={{ color: 'var(--text-faint)' }}>
                {h.weeklyCount}/7wk
              </span>
            </div>
          ))}
        </div>
      )}

      {habits.habits.length === 0 && (
        <p className="text-sm italic text-center py-2" style={{ color: 'var(--text-faint)' }}>
          Add habits to start tracking streaks.
        </p>
      )}
    </div>
  )
}
