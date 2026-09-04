// Component: StatsBand
// Purpose: Polished social proof numbers with theme-aware surfaces
import { STATS } from '../../utils/constants'

export default function StatsBand() {
  return (
    <div className="border-y py-10" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 px-5 text-center">
        {STATS.map((s, i) => (
          <div key={s.label} className="opacity-0 animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <p className="font-serif text-3xl [color:var(--accent-text)] tracking-tight mb-1">{s.num}</p>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
