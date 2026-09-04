// Component: EnergyCheckIn
// Purpose: Peak energy window check-in — CSS variables, 48px+ tap targets.
import { ENERGY_WINDOWS } from '../../hooks/useEnergy'

export default function EnergyCheckIn({ energy }) {
  const today      = energy.getTodayEnergy()
  const suggestion = energy.getSuggestion()

  if (today) {
    const win = ENERGY_WINDOWS.find(w => w.id === today.window)
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
        style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
      >
        <span className="text-xl flex-shrink-0">{win?.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Peak energy: <span className="font-semibold" style={{ color: 'var(--text)' }}>{win?.label} ({win?.hours})</span>
          </p>
          {suggestion && <p className="text-xs italic mt-0.5" style={{ color: 'var(--accent-text)' }}>{suggestion}</p>}
        </div>
        <button
          onClick={() => energy.setTodayEnergy(null)}
          className="hover-text text-xs flex-shrink-0 transition-colors"
          style={{ color: 'var(--text-faint)' }}
        >Change</button>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
        ⚡ When's your peak energy today?
      </p>
      <div className="grid grid-cols-3 gap-2">
        {ENERGY_WINDOWS.map(w => (
          <button
            key={w.id}
            onClick={() => energy.setTodayEnergy(w.id)}
            className="hover-accent-soft flex flex-col items-center gap-1.5 py-4 rounded-2xl border transition-all active:scale-95"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', minHeight: '80px' }}
          >
            <span className="text-2xl">{w.emoji}</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{w.label}</span>
            <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{w.hours}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
