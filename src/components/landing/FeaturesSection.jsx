// Component: FeaturesSection
// Purpose: 6-card grid showcasing the core app features
import FeatureCard from './FeatureCard'
import { FEATURES } from '../../utils/constants'

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-5 max-w-5xl mx-auto">
      <p className="text-xs font-medium uppercase tracking-widest text-forest-500 text-center mb-3">Features</p>
      <h2 className="font-serif text-4xl sm:text-5xl text-ink text-center leading-tight tracking-tight mb-4">
        Everything you need.<br />Nothing you don't.
      </h2>
      <p className="text-ink-muted text-center max-w-md mx-auto mb-14 text-base leading-relaxed">
        Built for people who value clarity over complexity. Your whole life, in one calm place.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </section>
  )
}
