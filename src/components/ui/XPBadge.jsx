// Component: XPBadge
// Purpose: Floating "+XP" badge that rises and fades when a task/habit is completed.
//          Triggered by XP value change. Positioned relative to parent element.
import { useState, memo, useEffect, useRef } from 'react'

const XPBadgeImpl = memo(function XPBadge({ xp, trigger }) {
  const [badges, setBadges]  = useState([])
  const prevXpRef            = useRef(xp)

  useEffect(() => {
    if (xp === undefined || xp === null) return
    const delta = xp - (prevXpRef.current ?? xp)
    prevXpRef.current = xp

    if (delta > 0) {
      const id = Date.now()
      setBadges(prev => [...prev, { id, delta }])
      setTimeout(() => setBadges(prev => prev.filter(b => b.id !== id)), 1000)
    }
  }, [xp, trigger])

  if (badges.length === 0) return null

  return (
    <>
      {badges.map(b => (
        <span
          key={b.id}
          className="pointer-events-none select-none absolute animate-xp-float text-xs font-bold z-50"
          style={{
            color:  'var(--accent)',
            top:    '-8px',
            right:  '0',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
          }}
        >
          +{b.delta} XP
        </span>
      ))}
    </>
  )
})
export default XPBadgeImpl
