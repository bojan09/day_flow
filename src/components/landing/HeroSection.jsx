// Component: HeroSection
// Purpose: Premium hero — CTA links to /auth for sign up
import { useNavigate } from 'react-router'
import HeroPreview from './HeroPreview'

export default function HeroSection() {
  const navigate = useNavigate()
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-5 text-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{ backgroundColor: 'var(--accent-light)' }} />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full opacity-30 blur-2xl pointer-events-none bg-terracotta-50" />

      <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 border opacity-0 animate-fade-up"
        style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)', color: 'var(--accent)' }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
        <span className="text-xs font-medium tracking-widest uppercase">Your daily command center</span>
      </div>

      <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.5rem] leading-[1.06] tracking-tight max-w-3xl mx-auto mb-5 text-balance opacity-0 animate-fade-up-d1"
        style={{ color: 'var(--text)' }}>
        Plan it. Track it.<br />
        <em className="[color:var(--accent)] not-italic">Own your day.</em>
      </h1>

      <p className="text-lg sm:text-xl max-w-xl mx-auto mb-9 leading-relaxed font-light opacity-0 animate-fade-up-d2"
        style={{ color: 'var(--text-muted)' }}>
        Tasks, habits, goals, notes, ideas — everything in one calm, focused space built for how you actually live.
      </p>

      <div className="flex gap-3 flex-wrap justify-center mb-16 opacity-0 animate-fade-up-d3">
        <button
          onClick={() => navigate('/auth')}
          className="px-8 py-3.5 rounded-full text-white font-medium text-base transition-all hover:shadow-float hover:-translate-y-0.5 active:scale-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Get started free →
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="hover-surface px-8 py-3.5 rounded-full font-light text-base transition-all border hover:-translate-y-0.5"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
        >
          Try demo
        </button>
      </div>

      <div className="w-full opacity-0 animate-fade-up-d3">
        <HeroPreview />
      </div>
    </section>
  )
}
