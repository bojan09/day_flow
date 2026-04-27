// Component: Badge
// Purpose: Polished status/priority badge
const COLORS = {
  high:    'bg-red-50 text-red-600 border-red-200',
  medium:  'bg-amber-50 text-amber-600 border-amber-200',
  low:     '[background-color:var(--accent-light)] [color:var(--accent)] [border-color:var(--accent-mid)]',
  default: '[background-color:var(--bg-secondary)] text-stone-600 [border-color:var(--border)]',
}

export default function Badge({ label, color = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${COLORS[color] ?? COLORS.default} ${className}`}>
      {label}
    </span>
  )
}
