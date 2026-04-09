// Component: FeaturesSection
// Purpose: Polished features grid with theme-aware cards and hover transitions
import { FEATURES } from '../../utils/constants'

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-5 max-w-5xl mx-auto">
      <p className="text-xs font-medium uppercase tracking-widest text-center mb-3 text-forest-500">Features</p>
      <h2 className="font-serif text-4xl sm:text-5xl text-center leading-tight tracking-tight mb-4 text-balance"
        style={{ color: 'var(--text)' }}>
        Everything you need.<br />Nothing you don't.
      </h2>
      <p className="text-center max-w-md mx-auto mb-14 text-base leading-relaxed"
        style={{ color: 'var(--text-muted)' }}>
        Built for people who value clarity over complexity. Your whole life, in one calm place.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="group rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-1 opacity-0 animate-fade-up"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-card)',
              animationDelay: `${i * 0.06}s`,
            }}
            onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 border transition-colors"
              style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
            >
              {f.icon}
            </div>
            <h3 className="font-serif text-lg mb-2" style={{ color: 'var(--text)' }}>{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
