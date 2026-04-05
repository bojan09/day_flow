// Component: Navbar
// Purpose: Fixed top navigation for the landing page
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

export default function Navbar() {
  const navigate = useNavigate()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-10 py-4 bg-parchment/80 backdrop-blur-md border-b border-stone-100">
      <span className="font-serif text-xl text-ink tracking-tight">
        Day<em className="not-italic text-forest-500">Flow</em>
      </span>
      <ul className="hidden sm:flex gap-8 list-none">
        {['Features', 'How it works', 'Pricing'].map(item => (
          <li key={item}>
            <a href={`#${item.toLowerCase().replace(/ /g, '-')}`}
               className="text-sm text-ink-muted hover:text-ink transition-colors">
              {item}
            </a>
          </li>
        ))}
      </ul>
      <Button size="sm" onClick={() => navigate('/dashboard')}>
        Get Started
      </Button>
    </nav>
  )
}
