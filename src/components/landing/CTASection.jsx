// Component: CTASection
// Purpose: Bottom call-to-action section with headline and sign-up button
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

export default function CTASection() {
  const navigate = useNavigate()
  return (
    <section id="pricing" className="py-24 px-5 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-parchment via-forest-50/40 to-parchment pointer-events-none" />
      <div className="relative max-w-xl mx-auto">
        <p className="text-xs font-medium uppercase tracking-widest text-forest-500 mb-4">Get started today</p>
        <h2 className="font-serif text-4xl sm:text-5xl text-ink leading-tight tracking-tight mb-5">
          Ready to take back<br />
          <em className="text-forest-500 not-italic">your days?</em>
        </h2>
        <p className="text-ink-muted mb-8 text-base leading-relaxed">
          Join thousands of people who've made DayFlow their daily command center. Free forever, no credit card needed.
        </p>
        <Button size="lg" onClick={() => navigate('/dashboard')}>
          Open DayFlow — It's Free
        </Button>
      </div>
    </section>
  )
}
