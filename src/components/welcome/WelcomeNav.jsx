// Component: WelcomeNav
// Purpose: Top navigation bar on the Welcome page — logo, nav links, auth CTAs
import { useNavigate } from 'react-router'

const NAV_LINKS = [
  { label: 'Features',     href: '#features'      },
  { label: 'How it works', href: '#how-it-works'  },
  { label: 'Pricing',      href: '#pricing'       },
]

export default function WelcomeNav() {
  const navigate = useNavigate()

  const scrollTo = (e, href) => {
    e.preventDefault()
    const el = document.getElementById(href.replace('#', ''))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-10 py-4 border-b"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor:     'var(--border-soft)',
      }}
    >
      {/* Logo — clicking logo on welcome page scrolls to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="font-serif text-2xl tracking-tight leading-none hover:opacity-80 transition-opacity"
        style={{ color: 'var(--text)' }}
      >
        Day<em className="not-italic [color:var(--accent)]">Flow</em>
      </button>

      {/* Nav links — hidden on mobile */}
      <ul className="hidden md:flex gap-8 list-none">
        {NAV_LINKS.map(item => (
          <li key={item.label}>
            <a
              href={item.href}
              onClick={e => scrollTo(e, item.href)}
              className="hover-text text-sm font-light transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Auth buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/auth?mode=signin')}
          className="hover-text hidden sm:block px-4 py-2 rounded-full text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          Login
        </button>
        <button
          onClick={() => navigate('/auth?mode=signup')}
          className="px-5 py-2 rounded-full text-white text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Get Started
        </button>
      </div>
    </nav>
  )
}
