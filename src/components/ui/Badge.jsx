// Component: Badge
// Purpose: Small colored label for priority, category, or status
const COLORS = {
  high:    'bg-red-50 text-red-600',
  medium:  'bg-amber-50 text-amber-600',
  low:     'bg-forest-50 text-forest-700',
  default: 'bg-stone-100 text-stone-600',
}

export default function Badge({ label, color = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[color] ?? COLORS.default} ${className}`}>
      {label}
    </span>
  )
}
