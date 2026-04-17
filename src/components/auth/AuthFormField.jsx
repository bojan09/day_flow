// Component: AuthFormField
// Purpose: Consistent labeled text/email input for auth forms
export default function AuthFormField({
  label, hint, error, className = '', ...props
}) {
  return (
    <div>
      {label && (
        <label
          className="text-xs font-medium uppercase tracking-wide block mb-1.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </label>
      )}
      <input
        className={`input-base ${error ? 'border-red-400 focus:ring-red-200' : ''} ${className}`}
        style={{
          backgroundColor: 'var(--bg)',
          borderColor:     error ? '#f87171' : 'var(--border)',
          color:           'var(--text)',
        }}
        {...props}
      />
      {hint && !error && (
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>{hint}</p>
      )}
      {error && (
        <p className="text-[11px] mt-1 text-red-500">{error}</p>
      )}
    </div>
  )
}
