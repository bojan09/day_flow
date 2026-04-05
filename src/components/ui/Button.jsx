// Component: Button
// Purpose: Reusable button with variant + size props

const VARIANTS = {
  primary:  'bg-forest-500 text-white hover:bg-forest-700 active:scale-95',
  ghost:    'bg-transparent text-ink-muted border border-stone-200 hover:bg-stone-50 active:scale-95',
  danger:   'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95',
  terracotta: 'bg-terracotta-500 text-white hover:bg-terracotta-700 active:scale-95',
}

const SIZES = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-medium
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
