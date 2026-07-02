// Component: PasswordInput
// Purpose: Password input with accessible show/hide toggle and strength indicator
import { useState } from 'react'

// Very simple strength check — just for signup feedback
function getStrength(pw) {
  if (!pw) return null
  let score = 0
  if (pw.length >= 8)              score++
  if (/[A-Z]/.test(pw))           score++
  if (/[0-9]/.test(pw))           score++
  if (/[^A-Za-z0-9]/.test(pw))    score++
  return score
}

const STRENGTH_LABELS = { 1: 'Weak', 2: 'Fair', 3: 'Good', 4: 'Strong' }
const STRENGTH_COLORS = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#3b82f6',
  4: '#3B6B4B',
}

export default function PasswordInput({
  value, onChange, placeholder = '••••••••',
  showStrength = false, label = 'Password',
  onForgot, ...props
}) {
  const [visible, setVisible] = useState(false)
  const strength = showStrength ? getStrength(value) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </label>
        {onForgot && (
          <button
            type="button"
            onClick={onForgot}
            className="text-[11px] font-medium transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            Forgot password?
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input-base pr-10"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor:     'var(--border)',
            color:           'var(--text)',
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="hover-text-muted absolute right-3 top-1/2 -translate-y-1/2 text-sm transition-colors"
          style={{ color: 'var(--text-faint)' }}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? '🙈' : '👁'}
        </button>
      </div>

      {/* Strength bar — only for signup */}
      {showStrength && value.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i <= (strength || 0)
                    ? STRENGTH_COLORS[strength]
                    : 'var(--border)',
                }}
              />
            ))}
          </div>
          {strength && (
            <p className="text-[11px]" style={{ color: STRENGTH_COLORS[strength] }}>
              {STRENGTH_LABELS[strength]}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
