// Component: WelcomeFooter
// Purpose: Marketing footer for the Welcome page (logged-out state)
import { useNavigate } from 'react-router-dom'

const LINKS = {
  Product:  ['Features', 'How it works', 'Pricing'],
  Company:  ['About', 'Blog', 'Careers'],
  Legal:    ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
}

export default function WelcomeFooter() {
  const navigate = useNavigate()

  return (
    <footer
      className="border-t px-5 py-14"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="font-serif text-2xl mb-3 block hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text)' }}
            >
              Day<em className="not-italic [color:var(--accent)]">Flow</em>
            </button>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-faint)' }}>
              Your daily command center for tasks, habits, goals, and personal growth.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--text-faint)' }}
              >
                {section}
              </p>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover-text text-sm transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            © 2026 DayFlow. Built for focused humans.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/auth?mode=signin')}
              className="hover-text-muted text-xs transition-colors"
              style={{ color: 'var(--text-faint)' }}
            >
              Login
            </button>
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="text-xs px-4 py-1.5 rounded-full text-white transition-all"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
