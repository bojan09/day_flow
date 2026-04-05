// Component: HeroSection
// Purpose: Full-screen hero with headline, sub-copy, CTA, and mini app preview card
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import HeroPreview from './HeroPreview'

export default function HeroSection() {
  const navigate = useNavigate()
  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-5 text-center relative overflow-hidden">
      {/* Soft background rings */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-forest-50 opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-terracotta-50 opacity-40 blur-2xl pointer-events-none" />

      {/* Tag */}
      <div className="inline-flex items-center gap-2 bg-forest-50 border border-forest-200 rounded-full px-4 py-1.5 mb-6 opacity-0 animate-fade-up">
        <span className="w-2 h-2 rounded-full bg-forest-500 animate-pulse" />
        <span className="text-xs text-forest-700 font-medium tracking-wide uppercase">Your daily command center</span>
      </div>

      {/* Headline */}
      <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-ink leading-[1.05] tracking-tight max-w-3xl mx-auto mb-5 opacity-0 animate-fade-up-d1">
        Plan it. Track it.<br />
        <em className="text-forest-500 not-italic">Own your day.</em>
      </h1>

      {/* Sub */}
      <p className="text-ink-muted text-lg sm:text-xl max-w-xl mx-auto mb-8 leading-relaxed opacity-0 animate-fade-up-d2">
        Tasks, habits, notes, reminders — everything in one calm, focused space designed around how you actually live.
      </p>

      {/* CTAs */}
      <div className="flex gap-3 flex-wrap justify-center mb-16 opacity-0 animate-fade-up-d3">
        <Button size="lg" onClick={() => navigate('/dashboard')}>
          Start for free →
        </Button>
        <Button size="lg" variant="ghost">
          See a demo
        </Button>
      </div>

      {/* Preview card */}
      <HeroPreview />
    </section>
  )
}
