// Component: EnergyCheckIn
// Purpose: Morning check-in for peak energy window — suggests when to schedule hard tasks
import Card from '../ui/Card'
import { ENERGY_WINDOWS } from '../../hooks/useEnergy'

export default function EnergyCheckIn({ energy }) {
  const today      = energy.getTodayEnergy()
  const suggestion = energy.getSuggestion()

  if (today) {
    const win = ENERGY_WINDOWS.find(w => w.id === today.window)
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-stone-100 shadow-sm">
        <span className="text-xl">{win?.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink-faint">Peak energy: <span className="font-medium text-ink">{win?.label} ({win?.hours})</span></p>
          {suggestion && <p className="text-xs text-forest-600 mt-0.5 italic">{suggestion}</p>}
        </div>
        <button
          onClick={() => energy.setTodayEnergy(null)}
          className="text-[10px] text-ink-faint hover:text-ink transition-colors"
        >Change</button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-3">⚡ When's your peak energy today?</p>
      <div className="grid grid-cols-3 gap-2">
        {ENERGY_WINDOWS.map(w => (
          <button
            key={w.id}
            onClick={() => energy.setTodayEnergy(w.id)}
            className="flex flex-col items-center gap-1 py-3 rounded-xl border border-stone-100 hover:border-forest-300 hover:bg-forest-50 transition-all group"
          >
            <span className="text-2xl">{w.emoji}</span>
            <span className="text-xs font-medium text-ink group-hover:text-forest-700">{w.label}</span>
            <span className="text-[10px] text-ink-faint">{w.hours}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
