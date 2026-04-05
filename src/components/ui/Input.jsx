// Component: Input
// Purpose: Labeled text input with consistent styling
export default function Input({ label, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-ink-muted uppercase tracking-wide">{label}</label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-parchment
          text-ink placeholder-ink-faint text-sm
          focus:outline-none focus:ring-2 focus:ring-forest-200 focus:border-forest-500
          transition-all ${className}
        `}
        {...props}
      />
    </div>
  )
}
