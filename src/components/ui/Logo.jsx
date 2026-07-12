// Component: Logo
// Purpose: DayFlow icon + wordmark lockup, used in SideNav/AuthPage/WelcomePage.
export default function Logo({ size = 28, showWordmark = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="64" height="64" rx="16" style={{ fill: 'var(--accent)' }} />
        <path d="M14 40 C 14 24, 28 18, 33 30 C 38 42, 52 36, 52 20"
              fill="none" stroke="#FAFAF8" strokeWidth="5" strokeLinecap="round" />
      </svg>
      {showWordmark && (
        <span className="font-sans font-semibold text-lg" style={{ color: 'var(--text)' }}>
          Day<span style={{ color: 'var(--accent)' }}>Flow</span>
        </span>
      )}
    </span>
  )
}
