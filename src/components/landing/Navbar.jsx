// Component: Navbar (Landing)
// Purpose: Fixed nav — logo scrolls to top, links smooth-scroll to sections, CTA to /auth
import { useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Features',     href: '#features'     },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing',      href: '#pricing'      },
]

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogoClick = () => {
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNavClick = (e, href) => {
    e.preventDefault()
    const el = document.getElementById(href.replace('#', ''))
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-10 py-4 border-b"
      style={{ borderColor: 'var(--border-soft)' }}>
      <button onClick={handleLogoClick}
        className="font-serif text-2xl tracking-tight leading-none hover:opacity-80 transition-opacity"
        style={{ color: 'var(--text)' }}>
        Day<em className="not-italic text-forest-500">Flow</em>
      </button>

      <ul className="hidden sm:flex gap-8 list-none">
        {NAV_LINKS.map(item => (
          <li key={item.label}>
            <a href={item.href} onClick={e => handleNavClick(e, item.href)}
              className="text-sm font-light transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={e => e.target.style.color = 'var(--text)'}
              onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/auth')}
          className="hidden sm:block px-4 py-2 rounded-full text-sm font-light transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseOver={e => e.target.style.color = 'var(--text)'}
          onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
          Sign in
        </button>
        <button onClick={() => navigate('/auth')}
          className="px-5 py-2 rounded-full text-white text-sm font-medium transition-all hover:shadow-float hover:-translate-y-0.5 active:scale-95"
          style={{ backgroundColor: 'var(--accent)' }}>
          Get Started
        </button>
      </div>
    </nav>
  )
}
