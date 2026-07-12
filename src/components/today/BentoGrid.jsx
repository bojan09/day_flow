// Component: BentoGrid
// Purpose: Responsive bento layout for Today view. Pinned widgets get the
//          larger cell; everything else is a standard cell. Mobile collapses
//          to a single column (hero first) via the `md:` grid breakpoint.
export default function BentoGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-min gap-4">
      {children}
    </div>
  )
}

export function BentoCell({ size = 'standard', children }) {
  const spanClass =
    size === 'hero'    ? 'md:col-span-2 md:row-span-2' :
    size === 'compact'  ? 'md:col-span-1' :
    'md:col-span-1'
  return (
    <div
      className={`${spanClass} rounded-3xl overflow-hidden`}
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
    >
      {children}
    </div>
  )
}
