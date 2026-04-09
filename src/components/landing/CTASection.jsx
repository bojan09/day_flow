// Component: CTASection
// Purpose: Premium CTA section with theme-aware gradient and floating button effect
import { useNavigate } from 'react-router-dom'

const APP_TABS = [
  { emoji: '☀️', label: 'Today'     },
  { emoji: '✅', label: 'Tasks'     },
  { emoji: '📝', label: 'Notes'     },
  { emoji: '🔁', label: 'Habits'    },
  { emoji: '💡', label: 'Ideas'     },
  { emoji: '🎯', label: 'Goals'     },
  { emoji: '⏱️', label: 'Focus'     },
  { emoji: '📊', label: 'Insights'  },
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
          Ready to take back<br />
          <em className="text-forest-500 not-italic">your days?</em>
        </h2>
        <p className="mb-10 text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Join thousands of focused people. Free forever — no card, no BS.
        </p>

        {/* App tab pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {APP_TABS.map(t => (
            <span key={t.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {t.emoji} {t.label}
            </span>
          ))}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-10 py-4 rounded-full text-white font-medium text-base transition-all hover:shadow-float hover:-translate-y-1 active:scale-95 animate-float"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Open DayFlow — It's Free
        </button>
      </div>
    </section>
  )
}
