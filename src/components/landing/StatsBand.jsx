// Component: StatsBand
// Purpose: Social proof metrics strip between hero and features
import { STATS } from '../../utils/constants'

export default function StatsBand() {
  return (
    <div className="border-y border-stone-100 py-10 bg-white">
      <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 px-5 text-center">
        {STATS.map(s => (
          <div key={s.label}>
            <p className="font-serif text-3xl text-forest-500 tracking-tight mb-1">{s.num}</p>
            <p className="text-xs text-ink-faint uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
