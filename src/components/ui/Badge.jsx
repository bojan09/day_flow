// Component: Badge
// Purpose: Polished status/priority badge
const COLORS = {
  high:    'bg-red-50 text-red-600 border-red-200',
  medium:  'bg-amber-50 text-amber-600 border-amber-200',
  low:     'bg-forest-50 text-forest-700 border-forest-200',
  default: 'bg-stone-100 text-stone-600 border-stone-200',
}

export default function Badge({ label, color = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${COLORS[color] ?? COLORS.default} ${className}`}>
      {label}
    </span>
  )
}
