// Component: EmptyState
// Purpose: Illustrated empty states — custom SVG per type, not just text + icon.
//          v6.2: proper illustrations, warmer tone, action button.
import { memo } from 'react'
import Button from './Button'

const ILLUSTRATIONS = {
  tasks: (
    <svg viewBox="0 0 120 80" className="w-28 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="15" width="80" height="12" rx="4" fill="var(--border)" />
      <rect x="20" y="33" width="60" height="10" rx="4" fill="var(--border)" opacity="0.6" />
      <rect x="20" y="50" width="70" height="10" rx="4" fill="var(--border)" opacity="0.4" />
      <circle cx="10" cy="21" r="4" stroke="var(--accent-mid)" strokeWidth="2" />
      <circle cx="10" cy="38" r="4" stroke="var(--border)" strokeWidth="2" />
      <circle cx="10" cy="55" r="4" stroke="var(--border)" strokeWidth="2" />
    </svg>
  ),
  habits: (
    <svg viewBox="0 0 120 80" className="w-28 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x={8 + i*16} y="20" width="12" height="40" rx="3"
          fill="var(--border)" opacity={0.3 + i*0.1} />
      ))}
      <rect x="8" y="20" width="12" height="40" rx="3" fill="var(--accent-mid)" opacity="0.6" />
      <rect x="24" y="30" width="12" height="30" rx="3" fill="var(--accent)" opacity="0.4" />
    </svg>
  ),
  notes: (
    <svg viewBox="0 0 120 80" className="w-28 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="10" width="70" height="60" rx="6" fill="var(--border)" opacity="0.3" />
      <rect x="35" y="25" width="50" height="6" rx="3" fill="var(--border)" />
      <rect x="35" y="37" width="40" height="5" rx="3" fill="var(--border)" opacity="0.7" />
      <rect x="35" y="48" width="45" height="5" rx="3" fill="var(--border)" opacity="0.5" />
      <circle cx="90" cy="65" r="12" fill="var(--accent)" opacity="0.9" />
      <line x1="86" y1="65" x2="94" y2="65" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="90" y1="61" x2="90" y2="69" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  goals: (
    <svg viewBox="0 0 120 80" className="w-28 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="40" r="28" stroke="var(--border)" strokeWidth="3" />
      <circle cx="60" cy="40" r="18" stroke="var(--accent-mid)" strokeWidth="2.5" />
      <circle cx="60" cy="40" r="8" fill="var(--accent)" opacity="0.3" />
      <circle cx="60" cy="40" r="3" fill="var(--accent)" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 120 80" className="w-28 h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="20" width="60" height="45" rx="8" fill="var(--border)" opacity="0.3" />
      <rect x="42" y="33" width="36" height="5" rx="2.5" fill="var(--border)" />
      <rect x="42" y="44" width="26" height="5" rx="2.5" fill="var(--border)" opacity="0.6" />
    </svg>
  ),
}

function EmptyState({ type = 'default', title, subtitle, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div className="mb-4 opacity-80">
        {ILLUSTRATIONS[type] || ILLUSTRATIONS.default}
      </div>
      {title && (
        <p className="font-serif text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>
          {title}
        </p>
      )}
      {subtitle && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-faint)', maxWidth: '220px' }}>
          {subtitle}
        </p>
      )}
      {action && onAction && (
        <Button onClick={onAction} className="mt-4">
          {action}
        </Button>
      )}
    </div>
  )
}

export default memo(EmptyState)
