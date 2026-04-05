// Component: Confetti
// Purpose: Burst of animated confetti particles for streak milestone celebrations
import { useEffect, useState } from 'react'

const COLORS = ['#3B6B4B','#C4622D','#5A9E6F','#F59E0B','#EC4899','#8B5CF6']

function randomBetween(a, b) { return a + Math.random() * (b - a) }

export default function Confetti({ trigger }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!trigger) return
    const list = Array.from({ length: 36 }, (_, i) => ({
      id:    i,
      x:     randomBetween(10, 90),
      delay: randomBetween(0, 0.4),
      color: COLORS[i % COLORS.length],
      size:  randomBetween(6, 12),
      rot:   randomBetween(-180, 180),
    }))
    setParticles(list)
    const t = setTimeout(() => setParticles([]), 2200)
    return () => clearTimeout(t)
  }, [trigger])

  if (!particles.length) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            animation: `confettiFall 1.8s ${p.delay}s ease-in forwards`,
            width:  p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
