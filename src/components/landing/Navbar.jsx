// Component: Navbar (Landing)
// Purpose: Polished fixed nav — fully theme-aware with glass background
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-10 py-4 glass border-b"
      style={{ borderColor: 'var(--border-soft)' }}
    >
      <span className="font-serif text-2xl tracking-tight leading-none" style={{ color: 'var(--text)' }}>
        Day<em className="not-italic text-forest-500">Flow</em>
      </span>

      <ul className="hidden sm:flex gap-8 list-none">
        {['Features', 'How it works', 'Pricing'].map(item => (
          <li key={item}>
            <a
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="text-sm font-light transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={e => e.target.style.color = 'var(--text)'}
              onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
            >{item}</a>
          </li>
        ))}
      </ul>

      <button
        onClick={() => navigate('/dashboard')}
        className="px-5 py-2 rounded-full text-white text-sm font-medium transition-all hover:shadow-float hover:-translate-y-0.5 active:scale-95"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        Get Started
      </button>
    </nav>
  )
}
