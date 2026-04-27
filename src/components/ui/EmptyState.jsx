// Component: EmptyState
// Purpose: Reusable illustrated empty state with SVG spot art, title, subtitle, and optional CTA
const ILLUSTRATIONS = {
  tasks: (
    <svg viewBox="0 0 120 80" className="w-28 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="14" width="80" height="52" rx="8" fill="#EEF4ED" stroke="#D0E4CC" strokeWidth="1.5"/>
      <rect x="32" y="26" width="40" height="5" rx="2.5" fill="#A7C9A0"/>
      <rect x="32" y="36" width="56" height="4" rx="2" fill="#D0E4CC"/>
      <rect x="32" y="45" width="48" height="4" rx="2" fill="#D0E4CC"/>
      <circle cx="85" cy="58" r="12" fill="#3B6B4B"/>
      <path d="M80 58l3.5 3.5L90 53" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  notes: (
    <svg viewBox="0 0 120 80" className="w-28 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="10" width="55" height="65" rx="6" fill="#EEF4ED" stroke="#D0E4CC" strokeWidth="1.5"/>
      <rect x="34" y="22" width="37" height="4" rx="2" fill="#A7C9A0"/>
      <rect x="34" y="31" width="37" height="3" rx="1.5" fill="#D0E4CC"/>
      <rect x="34" y="39" width="28" height="3" rx="1.5" fill="#D0E4CC"/>
      <rect x="34" y="47" width="32" height="3" rx="1.5" fill="#D0E4CC"/>
      <path d="M75 54l8-8 6 6-8 8H75v-6z" fill="#C4622D" opacity="0.7"/>
    </svg>
  ),
  habits: (
    <svg viewBox="0 0 120 80" className="w-28 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[0,1,2,3,4,5,6].map((d,i) => (
        <circle key={i} cx={22 + i * 11} cy="40" r="7" fill={i < 4 ? '#3B6B4B' : '#EEF4ED'} stroke={i < 4 ? '#2A4E36' : '#D0E4CC'} strokeWidth="1"/>
      ))}
      {[0,1,2,3].map((i) => (
        <path key={i} d={`M${18 + i * 11} 40l2.5 2.5L${24.5 + i * 11} 37`} stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      ))}
      <text x="60" y="68" textAnchor="middle" fontSize="11" fill="#A7C9A0" fontFamily="serif">keep going!</text>
    </svg>
  ),
  default: (
    <svg viewBox="0 0 120 80" className="w-28 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="38" r="24" fill="#EEF4ED" stroke="#D0E4CC" strokeWidth="1.5"/>
      <circle cx="52" cy="34" r="2" fill="#A7C9A0"/>
      <circle cx="68" cy="34" r="2" fill="#A7C9A0"/>
      <path d="M50 44c2.5 4 17.5 4 20 0" stroke="#A7C9A0" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

export default function EmptyState({ type = 'default', title, subtitle, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {ILLUSTRATIONS[type] || ILLUSTRATIONS.default}
      {title && <p className="mt-3 text-sm font-medium [color:var(--text)]">{title}</p>}
      {subtitle && <p className="mt-1 text-xs [color:var(--text-faint)] max-w-xs">{subtitle}</p>}
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-full [background-color:var(--accent)] text-white text-xs font-medium hover:[background-color:var(--accent)] transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  )
}
