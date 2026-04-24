// Component: WaterTracker
// Purpose: Tap-to-log hydration — 48px glass buttons, CSS variables throughout.
export default function WaterTracker({ water }) {
  const { count, goal, pct } = water.getProgress()
  const glasses = Array.from({ length: goal }, (_, i) => i < count)

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          💧 Hydration
        </p>
        <span
          className="text-xs font-semibold"
          style={{ color: pct >= 100 ? 'var(--accent)' : '#3B82F6' }}
        >
          {count}/{goal} glasses
        </span>
      </div>

      {/* Glass grid — 48px buttons for easy tapping */}
      <div className="flex flex-wrap gap-2 mb-4">
        {glasses.map((filled, i) => (
          <button
            key={i}
            onClick={filled ? water.removeGlass : water.addGlass}
            className="w-12 h-12 rounded-xl text-xl flex items-center justify-center transition-all active:scale-90"
            style={{
              backgroundColor: filled ? '#EFF6FF' : 'var(--bg-secondary)',
              color:           filled ? '#3B82F6' : 'var(--text-faint)',
            }}
            title={filled ? 'Tap to remove' : 'Tap to add'}
            aria-label={filled ? 'Remove glass' : 'Add glass'}
          >
            💧
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width:           `${pct}%`,
            backgroundColor: pct >= 100 ? 'var(--accent)' : '#3B82F6',
          }}
        />
      </div>

      {pct >= 100 && (
        <p className="text-[11px] font-medium mt-2 text-center" style={{ color: 'var(--accent)' }}>
          🎉 Daily goal reached!
        </p>
      )}
    </div>
  )
}
