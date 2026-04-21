// Component: WelcomeHero
// Purpose: Full-screen hero — headline, subtext, centred dual CTAs, scroll hint
import { useNavigate } from 'react-router-dom'

export default function WelcomeHero() {
  const navigate = useNavigate()

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-20 text-center relative"
      style={{ overflow: 'hidden' }}
    >
      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-[0.07] pointer-events-none"
        style={{ backgroundColor: 'var(--accent)' }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-[0.05] pointer-events-none"
        style={{ backgroundColor: '#C4622D' }} />

      {/* Badge */}
      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 border text-xs font-medium tracking-widest uppercase opacity-0 animate-fade-up"
        style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)', color: 'var(--accent)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
        Your daily command center
      </div>

      {/* Headline */}
      <h1
        className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight max-w-3xl mx-auto mb-5 opacity-0 animate-fade-up-d1"
        style={{ color: 'var(--text)' }}
      >
        Plan it. Track it.
        <br />
        <em className="not-italic text-forest-500">Own your day.</em>
      </h1>

      {/* Subheadline */}
      <p
        className="text-lg sm:text-xl max-w-lg mx-auto mb-10 leading-relaxed font-light opacity-0 animate-fade-up-d2"
        style={{ color: 'var(--text-muted)' }}
      >
        Tasks, habits, goals, notes, and insights — all in one focused space built around how you actually live.
      </p>

      {/* CTAs — always row, centred, equal height */}
      <div className="flex flex-row items-center justify-center gap-3 flex-wrap opacity-0 animate-fade-up-d3">
        <button
          onClick={() => navigate('/auth?mode=signup')}
          className="px-8 py-3.5 rounded-full text-white font-medium text-base transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
          style={{ backgroundColor: 'var(--accent)' }}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,107,75,0.35)'}
          onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
        >
          Get Started — Free
        </button>
        <button
          onClick={() => navigate('/auth?mode=signin')}
          className="px-8 py-3.5 rounded-full text-base font-medium transition-all border hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: 'transparent' }}
          onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--text-faint)' }}
          onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          Login
        </button>
      </div>

      {/* Scroll hint — centred below CTAs, not absolute positioned */}
      <div className="flex flex-col items-center gap-1 mt-16 opacity-0 animate-fade-up-d3">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
          Scroll to explore
        </span>
        <div className="w-px h-8" style={{ backgroundColor: 'var(--border)' }} />
      </div>
    </section>
  )
}
