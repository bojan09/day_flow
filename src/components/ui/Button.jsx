// Component: Button
// Purpose: Polished button with variants, sizes, loading state, and micro-interactions

const VARIANTS = {
  primary:    '[background-color:var(--accent)] text-white hover:[background-color:var(--accent)] active:scale-[0.97] shadow-sm hover:shadow-md',
  ghost:      'bg-transparent border border-theme text-muted hover:bg-app-secondary active:scale-[0.97]',
  danger:     'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 active:scale-[0.97]',
  terracotta: 'bg-terracotta-500 text-white hover:bg-terracotta-700 active:scale-[0.97] shadow-sm',
  subtle:     'bg-app-secondary text-muted hover:text-theme border border-theme active:scale-[0.97]',
}

const SIZES = {
  xs: 'px-3 py-1 text-xs gap-1',
  sm: 'px-3.5 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
}

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, className = '', ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-full font-medium
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${SIZES[size] ?? SIZES.md}
        ${className}
      `}
      style={{ backgroundColor: variant === 'primary' ? 'var(--accent)' : undefined }}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  )
}
