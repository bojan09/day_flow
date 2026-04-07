// Component: WaterTracker
// Purpose: Tap-to-log hydration tracker with glass icons and daily goal progress
import Card from '../ui/Card'

export default function WaterTracker({ water }) {
  const { count, goal, pct } = water.getProgress()
  const glasses = Array.from({ length: goal }, (_, i) => i < count)

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">💧 Hydration</p>
        <span className={`text-xs font-semibold ${pct >= 100 ? 'text-forest-500' : 'text-blue-500'}`}>
          {count}/{goal} glasses
        </span>
      </div>

      {/* Glass grid */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {glasses.map((filled, i) => (
          <button
            key={i}
            onClick={filled ? water.removeGlass : water.addGlass}
            className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
              filled
                ? 'bg-blue-100 text-blue-500 hover:bg-blue-50'
                : 'bg-stone-100 text-stone-300 hover:bg-blue-50 hover:text-blue-300'
            }`}
            title={filled ? 'Tap to remove' : 'Tap to add'}
          >
            💧
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-forest-500' : 'bg-blue-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct >= 100 && (
        <p className="text-[11px] text-forest-500 font-medium mt-1.5 text-center">
          🎉 Daily goal reached!
        </p>
      )}
    </Card>
  )
}
