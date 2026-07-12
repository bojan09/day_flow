import { useId } from 'react'

// Component: Input
// Purpose: Theme-aware labeled input with smooth focus ring
export default function Input({ label, className = '', hint, id, ...props }) {
  const generatedId = useId()
  const inputId = id || generatedId
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-base ${className}`}
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
        }}
        {...props}
      />
      {hint && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{hint}</p>}
    </div>
  )
}
