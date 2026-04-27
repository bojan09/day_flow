// Component: LandingFooter
// Purpose: Polished minimal footer with theme-aware colors and subtle links
export default function LandingFooter() {
  return (
    <footer className="border-t py-8 px-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-serif text-xl" style={{ color: 'var(--text)' }}>
          Day<em className="not-italic [color:var(--accent)]">Flow</em>
        </span>
        <div className="flex items-center gap-6">
          {['Privacy', 'Terms', 'Contact'].map(link => (
            <a key={link} href="#"
              className="text-xs transition-colors"
              style={{ color: 'var(--text-faint)' }}
              onMouseOver={e => e.target.style.color = 'var(--text-muted)'}
              onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
            >{link}</a>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          © 2026 DayFlow. Built for focused humans.
        </p>
      </div>
    </footer>
  )
}
