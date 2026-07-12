// Component: WeeklyRings
// Purpose: 7-ring row for the current week — fill state per day (done/partial/
//          rest), tap a ring to select that day. `days` is an array of 7
//          { date, label, state } objects, oldest first, computed by the
//          caller from `sessions` (see WorkoutsView).
export default function WeeklyRings({ days, selectedDate, onSelect }) {
  return (
    <div className="rounded-3xl p-5" style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
      <div className="flex justify-between">
        {days.map(d => {
          const filled = d.state === 'done' ? 1 : d.state === 'partial' ? 0.5 : 0
          const circumference = 2 * Math.PI * 14
          return (
            <button key={d.date} onClick={() => onSelect(d.date)}
              aria-label={`${d.label}: ${d.state}`}
              className="flex flex-col items-center gap-1">
              <svg width="34" height="34" viewBox="0 0 34 34">
                <circle cx="17" cy="17" r="14" fill="none" stroke="var(--border-soft)" strokeWidth="4" />
                <circle cx="17" cy="17" r="14" fill="none" stroke="var(--accent)" strokeWidth="4"
                  strokeDasharray={circumference} strokeDashoffset={circumference * (1 - filled)}
                  strokeLinecap="round" transform="rotate(-90 17 17)"
                  style={{ opacity: d.date === selectedDate ? 1 : 0.7 }} />
              </svg>
              <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{d.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
