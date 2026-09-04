// Component: WelcomeCTA
// Purpose: Final CTA section on Welcome page with sign-up and demo options
import { useNavigate } from 'react-router'

const APP_TABS = [
  { emoji: '☀️', label: 'Today'      }, { emoji: '✅', label: 'Tasks'    },
  { emoji: '📝', label: 'Notes'      }, { emoji: '🔁', label: 'Habits'   },
  { emoji: '💡', label: 'Ideas'      }, { emoji: '🎯', label: 'Goals'    },
  { emoji: '⏱️', label: 'Focus'      }, { emoji: '📊', label: 'Insights' },
  { emoji: '⚖️', label: 'Balance'    }, { emoji: '🧠', label: 'Brain Dump'},
]

export default function WelcomeCTA() {
  const navigate = useNavigate()

  return (
    <section id="pricing" className="py-24 px-5 text-center relative overflow-hidden">
      {/* Subtle background tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, var(--bg), var(--accent-light), var(--bg))' }}
      />

      <div className="relative max-w-2xl mx-auto">
        <p className="text-xs font-medium uppercase tracking-widest [color:var(--accent)] mb-4">
          Free forever
        </p>
        <h2
          className="font-serif text-4xl sm:text-5xl leading-tight tracking-tight mb-5"
          style={{ color: 'var(--text)' }}
        >
          Ready to take back<br />
          <em className="not-italic [color:var(--accent)]">your days?</em>
        </h2>
        <p className="mb-10 text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          No credit card. No lock-in. Your data stays private.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {APP_TABS.map(t => (
            <span
              key={t.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor:     'var(--border)',
                color:           'var(--text-muted)',
              }}
            >
              {t.emoji} {t.label}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="hover-lift px-10 py-4 rounded-full text-white font-medium text-base transition-all hover:-translate-y-1 active:scale-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Create free account
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="hover-surface px-6 py-4 rounded-full text-sm font-light transition-all border"
            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
          >
            Try without signing up
          </button>
        </div>
      </div>
    </section>
  )
}
