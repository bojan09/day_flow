// Component: ProgressRing
// Purpose: Circular day-progress ring — v6.2: animated mount, gradient stroke,
//          card-hover elevation, animated progress bars using AnimatedBar.
import { memo, useEffect, useState } from 'react'
import AnimatedBar from '../ui/AnimatedBar'

function ProgressRing({ tasks, habits }) {
  const todayTasks = tasks.getTodayTasks()
  const taskDone   = todayTasks.filter(t => t.completed).length
  const taskTotal  = todayTasks.length
  const habitPct   = habits.getTodayCompletion()

  const taskScore = taskTotal > 0 ? (taskDone / taskTotal) * 100 : 0
  const overall   = taskTotal === 0 && habits.habits.length === 0 ? 0
    : taskTotal === 0 ? habitPct
    : habits.habits.length === 0 ? taskScore
    : Math.round(taskScore * 0.6 + habitPct * 0.4)

  // Animate ring from 0 on mount
  const [displayPct, setDisplayPct] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setDisplayPct(overall), 100)
    return () => clearTimeout(t)
  }, [overall])

  const R    = 36
  const circ = 2 * Math.PI * R
  const dash = (displayPct / 100) * circ

  const ringColor = overall >= 80 ? 'var(--accent)' : overall >= 50 ? '#5A9E6F' : 'var(--accent-mid)'

  const statusEmoji = overall === 100 ? '🎉' : overall >= 80 ? '🔥' : overall >= 50 ? '💪' : '🌱'
  const statusText  = overall === 100 ? 'Perfect day!' : overall >= 80 ? 'Almost there!' : overall >= 50 ? 'Keep going' : "Let's get started"

  return (
    <div
      className="rounded-2xl border p-5 flex items-center gap-5 card-hover"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Animated ring */}
      <div className="relative flex-shrink-0">
        {/* Subtle glow behind ring */}
        {overall > 0 && (
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-20"
            style={{ backgroundColor: ringColor }}
          />
        )}
        <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
          {/* Track */}
          <circle cx="45" cy="45" r={R} fill="none"
            stroke="var(--border)" strokeWidth="7" />
          {/* Progress — animated via displayPct */}
          <circle cx="45" cy="45" r={R} fill="none"
            stroke={ringColor} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34,1.1,0.64,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-xl leading-none font-bold" style={{ color: 'var(--text)' }}>
            {overall}%
          </span>
          <span style={{ color: 'var(--text-faint)', fontSize: 'var(--text-2xs)' }}
            className="uppercase tracking-wide">
            done
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex-1 space-y-3">
        {[
          {
            label: 'Tasks',
            val:   `${taskDone} / ${taskTotal}`,
            pct:   taskTotal > 0 ? (taskDone / taskTotal) * 100 : 0,
            color: 'var(--accent)',
          },
          {
            label: 'Habits',
            val:   `${habitPct}%`,
            pct:   habitPct,
            color: '#7C3AED',
          },
        ].map((row, i) => (
          <div key={row.label}>
            <div className="flex justify-between mb-1.5">
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                {row.label}
              </span>
              <span className="font-semibold" style={{ color: 'var(--text)', fontSize: 'var(--text-xs)' }}>
                {row.val}
              </span>
            </div>
            <AnimatedBar pct={row.pct} color={row.color} delay={i * 120} />
          </div>
        ))}

        {/* Status line */}
        <p style={{ color: 'var(--text-faint)', fontSize: 'var(--text-xs)' }}
          className="italic">
          {statusEmoji} {statusText}
        </p>
      </div>
    </div>
  )
}

export default memo(ProgressRing)
