// Component: Badge
// Purpose: Polished status/priority badge
// Tone tokens rather than fixed Tailwind palette classes: bg-red-50 and
// bg-amber-50 are light-mode swatches, so in dark mode these badges rendered
// as bright chips with low-contrast text.
const COLORS = {
  high:    '[background-color:var(--tone-red-bg)] [color:var(--tone-red-text)] [border-color:var(--tone-red-border)]',
  medium:  '[background-color:var(--tone-amber-bg)] [color:var(--tone-amber-text)] [border-color:var(--tone-amber-border)]',
  low:     '[background-color:var(--accent-light)] [color:var(--accent-text)] [border-color:var(--accent-mid)]',
  default: '[background-color:var(--bg-secondary)] [color:var(--text-muted)] [border-color:var(--border)]',
}

export default function Badge({ label, color = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${COLORS[color] ?? COLORS.default} ${className}`}>
      {label}
    </span>
  )
}
