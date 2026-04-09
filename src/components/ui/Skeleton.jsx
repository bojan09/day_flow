// Component: Skeleton
// Purpose: Animated shimmer placeholders for loading states
export function SkeletonLine({ width = 'w-full', height = 'h-3', className = '' }) {
  return (
    <div className={`skeleton rounded-md ${width} ${height} ${className}`} />
  )
}

export function SkeletonCard({ rows = 3, className = '' }) {
  return (
    <div className={`bg-surface card p-5 space-y-3 ${className}`}>
      <SkeletonLine width="w-1/3" height="h-3" />
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonLine key={i} width={i % 2 === 0 ? 'w-full' : 'w-4/5'} height="h-2.5" />
      ))}
    </div>
  )
}

export function SkeletonTaskList() {
  return (
    <div className="bg-surface card overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-theme-soft">
        <SkeletonLine width="w-32" height="h-4" />
      </div>
      {[1,2,3,4].map(i => (
        <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-theme-soft last:border-0">
          <div className="w-5 h-5 rounded-md skeleton flex-shrink-0" />
          <SkeletonLine width={i % 2 === 0 ? 'w-3/4' : 'w-2/3'} height="h-3" />
          <div className="w-12 h-4 skeleton rounded-full ml-auto" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonHabitRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-theme-soft last:border-0"
      style={{ gridTemplateColumns: '1fr repeat(7, 2rem)' }}>
      <div className="flex items-center gap-2 flex-1">
        <div className="w-7 h-7 rounded-full skeleton" />
        <SkeletonLine width="w-24" height="h-3" />
      </div>
      {[1,2,3,4,5,6,7].map(i => (
        <div key={i} className="w-7 h-7 rounded-full skeleton" />
      ))}
    </div>
  )
}

export default function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}
