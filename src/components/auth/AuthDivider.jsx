// Component: AuthDivider
// Purpose: "or" divider between OAuth and email/password form
export default function AuthDivider({ label = 'or' }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
      <span className="text-xs px-1" style={{ color: 'var(--text-faint)' }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
    </div>
  )
}
