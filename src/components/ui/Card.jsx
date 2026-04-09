// Component: Card
// Purpose: Polished surface container with theme-aware colors and hover shadow
export default function Card({ children, className = '', noPad = false, hover = false }) {
  return (
    <div
      className={`
        bg-surface rounded-2xl border border-theme shadow-card
        ${hover ? 'hover:shadow-hover hover:-translate-y-0.5 cursor-pointer' : ''}
        transition-all duration-200
        ${noPad ? '' : 'p-5'}
        ${className}
      `}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {children}
    </div>
  )
}
