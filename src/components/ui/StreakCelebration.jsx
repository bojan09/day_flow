// Component: StreakCelebration
// Purpose: Lightweight confetti burst when a streak milestone is hit (7/21/30/100 days).
//          Uses CSS-only animation — no GSAP, no libraries.
import { useState, memo, useEffect } from 'react'

const MILESTONES = [7, 14, 21, 30, 60, 100, 365]
const COLORS     = ['#3B6B4B','#F59E0B','#3B82F6','#7C3AED','#EC4899','#10B981']

function randomBetween(a, b) { return a + Math.random() * (b - a) }

export function useStreakCelebration(streak) {
  const [celebrating, setCelebrating] = useState(false)
  const [milestone,   setMilestone]   = useState(null)
  const prevStreakRef = { current: null }

  useEffect(() => {
    if (prevStreakRef.current === null) { prevStreakRef.current = streak; return }
    if (streak > prevStreakRef.current && MILESTONES.includes(streak)) {
      setMilestone(streak)
      setCelebrating(true)
      setTimeout(() => setCelebrating(false), 2500)
    }
    prevStreakRef.current = streak
  }, [streak])

  return { celebrating, milestone }
}

const StreakCelebrationImpl = memo(function StreakCelebration({ streak, name }) {
  const { celebrating, milestone } = useStreakCelebration(streak)

  if (!celebrating) return null

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id:    i,
    color: COLORS[i % COLORS.length],
    left:  `${randomBetween(10, 90)}%`,
    delay: `${randomBetween(0, 0.4)}s`,
    size:  `${randomBetween(6, 10)}px`,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] flex items-center justify-center">
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute top-1/3 animate-confetti-fall rounded-sm"
          style={{
            left:             p.left,
            width:            p.size,
            height:           p.size,
            backgroundColor:  p.color,
            animationDelay:   p.delay,
            animationDuration:'0.8s',
          }}
        />
      ))}

      {/* Toast */}
      <div
        className="animate-spring-in px-6 py-4 rounded-2xl shadow-xl text-center"
        style={{
          backgroundColor: 'var(--surface)',
          border:          '2px solid var(--accent-mid)',
          boxShadow:       '0 8px 40px rgba(59,107,75,0.25)',
        }}
      >
        <p className="text-3xl mb-1">🔥</p>
        <p className="font-serif text-xl font-bold" style={{ color: 'var(--accent)' }}>
          {milestone}-day streak!
        </p>
        {name && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {name}
          </p>
        )}
      </div>
    </div>
  )
})
export default StreakCelebrationImpl
