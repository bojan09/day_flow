// Component: AnimatedBar
// Purpose: Reusable animated progress bar — fills from 0 to target width on mount.
//          Used in AnalyticsPanel, DailySummaryCard, CategoryTrends, GoalCard etc.
import { memo, useEffect, useRef } from 'react'

const AnimatedBarImpl = memo(function AnimatedBar({
  pct = 0,
  color = 'var(--accent)',
  height = 'h-2',
  delay = 0,
  rounded = 'rounded-full',
}) {
  const barRef = useRef(null)

  useEffect(() => {
    if (!barRef.current) return
    // Start at 0, animate to target after delay
    barRef.current.style.width = '0%'
    const timer = setTimeout(() => {
      if (barRef.current) {
        barRef.current.style.width = `${Math.max(0, Math.min(100, pct))}%`
      }
    }, delay + 60) // 60ms ensures CSS transition kicks in after paint
    return () => clearTimeout(timer)
  }, [pct, delay])

  return (
    <div
      className={`w-full ${height} ${rounded} overflow-hidden`}
      style={{ backgroundColor: 'var(--border)' }}
    >
      <div
        ref={barRef}
        className={`${height} ${rounded}`}
        style={{
          width:           '0%',
          backgroundColor: color,
          transition:      'width 0.7s cubic-bezier(0.34, 1.1, 0.64, 1)',
        }}
      />
    </div>
  )
})
export default AnimatedBarImpl
