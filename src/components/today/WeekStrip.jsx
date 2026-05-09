// Component: WeekStrip
// Purpose: 7-day week strip with swipe-left/right to navigate weeks (Phase 4.1.3).
//          Active day highlighted, today ring, smooth week transitions.
import { memo, useState, useRef } from 'react'
import { format, isToday, isSameDay, addWeeks, subWeeks } from 'date-fns'
import { getWeekDays } from '../../utils/dateUtils'

function WeekStrip() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selected,   setSelected]   = useState(new Date())
  const touchStartX = useRef(null)

  const baseDate = addWeeks(new Date(), weekOffset)
  const days     = getWeekDays(baseDate)

  // ── Swipe gesture ──────────────────────────────────────────────────────────
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) setWeekOffset(w => dx < 0 ? w + 1 : w - 1)
    touchStartX.current = null
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Week navigation header */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-2"
      >
        <button
          onClick={() => setWeekOffset(w => w - 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
          style={{ color: 'var(--text-faint)' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Previous week"
        >‹</button>

        <button
          onClick={() => { setWeekOffset(0); setSelected(new Date()) }}
          className="text-xs font-medium transition-colors"
          style={{ color: weekOffset === 0 ? 'var(--accent)' : 'var(--text-faint)' }}
        >
          {weekOffset === 0 ? 'This week' : format(baseDate, 'MMM d')}
        </button>

        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
          style={{ color: 'var(--text-faint)' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Next week"
        >›</button>
      </div>

      {/* Day buttons — swipeable */}
      <div
        className="flex gap-1 px-3 pb-3 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {days.map(day => {
          const active   = isSameDay(day, selected)
          const todayDay = isToday(day)
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelected(day)}
              className="flex flex-col items-center gap-0.5 flex-1 py-2.5 rounded-xl transition-all duration-200 active:scale-95"
              style={active
                ? { backgroundColor: 'var(--accent)', color: 'white' }
                : todayDay
                ? { backgroundColor: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent-mid)' }
                : { backgroundColor: 'transparent', color: 'var(--text-muted)' }
              }
            >
              <span className="text-[10px] uppercase tracking-wider font-medium opacity-80">
                {format(day, 'EEE')}
              </span>
              <span className="text-base font-semibold leading-tight">{format(day, 'd')}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default memo(WeekStrip)
