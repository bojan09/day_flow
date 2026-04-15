// Component: CTASection
// Purpose: Bottom CTA — sign up link and try demo option
import { useNavigate } from 'react-router-dom'

const APP_TABS = [
  { emoji: '☀️', label: 'Today'     }, { emoji: '✅', label: 'Tasks'    },
  { emoji: '📝', label: 'Notes'     }, { emoji: '🔁', label: 'Habits'   },
  { emoji: '💡', label: 'Ideas'     }, { emoji: '🎯', label: 'Goals'    },
  { emoji: '⏱️', label: 'Focus'     }, { emoji: '📊', label: 'Insights' },
  { emoji: '⚖️', label: 'Balance'   },
]

export default function CTASection() {
  const navigate = useNavigate()
  return (
    <section id="pricing" className="py-24 px-5 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, var(--bg), var(--accent-light), var(--bg))' }} />
      <div className="relative max-w-2xl mx-auto">
        <p className="text-xs font-medium uppercase tracking-widest text-forest-500 mb-4">Get started today</p>
        <h2 className="font-serif text-4xl sm:text-5xl leading-tight tracking-tight mb-5 text-balance"
          style={{ color: 'var(--text)' }}>
          Ready to take back<br /><em className="text-forest-500 not-italic">your days?</em>
        </h2>
        <p className="mb-10 text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Free forever. No card required. Your data stays private.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {APP_TABS.map(t => (
            <span key={t.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {t.emoji} {t.label}
            </span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/auth')}
            className="px-10 py-4 rounded-full text-white font-medium text-base transition-all hover:shadow-float hover:-translate-y-1 active:scale-95 animate-float"
            style={{ backgroundColor: 'var(--accent)' }}>
            Create free account
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-4 rounded-full text-sm font-light transition-all border"
            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            Try without signing up
          </button>
        </div>
      </div>
    </section>
  )
}
