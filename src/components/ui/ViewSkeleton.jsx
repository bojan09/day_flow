// Component: ViewSkeleton
// Purpose: Shows animated placeholder cards while data loads from Supabase.
//          Prevents empty state from flashing before data arrives.
//          Each view type gets a skeleton that matches its real card layout.
import { memo } from 'react'

function SkeletonLine({ width = 'w-full', height = 'h-3.5' }) {
  return (
    <div
      className={`${width} ${height} rounded-lg animate-pulse`}
      style={{ backgroundColor: 'var(--border)' }}
    />
  )
}

function SkeletonCard({ rows = 2, showIcon = false }) {
  return (
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        {showIcon && (
          <div className="w-8 h-8 rounded-xl animate-pulse flex-shrink-0"
            style={{ backgroundColor: 'var(--border)' }} />
        )}
        <div className="flex-1 space-y-2">
          <SkeletonLine width="w-3/4" />
          {rows > 1 && <SkeletonLine width="w-1/2" height="h-2.5" />}
        </div>
      </div>
      {rows > 2 && <SkeletonLine width="w-full" height="h-2" />}
    </div>
  )
}

function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b"
      style={{ borderColor: 'var(--border-soft)' }}>
      <div className="w-4 h-4 rounded animate-pulse flex-shrink-0"
        style={{ backgroundColor: 'var(--border)' }} />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine width="w-2/3" />
        <SkeletonLine width="w-1/3" height="h-2.5" />
      </div>
      <div className="w-12 h-5 rounded-full animate-pulse flex-shrink-0"
        style={{ backgroundColor: 'var(--border)' }} />
    </div>
  )
}

// ── View-specific skeletons ────────────────────────────────────────────────────
const SKELETONS = {
  tasks: () => (
    <div className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      {[1,2,3,4,5].map(i => <SkeletonListItem key={i} />)}
    </div>
  ),
  habits: () => (
    <div className="space-y-3">
      {[1,2,3].map(i => <SkeletonCard key={i} rows={2} showIcon />)}
    </div>
  ),
  notes: () => (
    <div className="space-y-3">
      {[1,2,3,4].map(i => <SkeletonCard key={i} rows={3} />)}
    </div>
  ),
  goals: () => (
    <div className="space-y-3">
      {[1,2].map(i => <SkeletonCard key={i} rows={3} showIcon />)}
    </div>
  ),
  workouts: () => (
    <div className="space-y-3">
      {[1,2,3].map(i => <SkeletonCard key={i} rows={2} showIcon />)}
    </div>
  ),
  ideas: () => (
    <div className="space-y-2">
      {[1,2,3,4].map(i => <SkeletonCard key={i} rows={2} />)}
    </div>
  ),
  bookmarks: () => (
    <div className="space-y-2">
      {[1,2,3,4].map(i => <SkeletonCard key={i} rows={2} showIcon />)}
    </div>
  ),
  projects: () => (
    <div className="space-y-3">
      {[1,2].map(i => <SkeletonCard key={i} rows={3} showIcon />)}
    </div>
  ),
  default: () => (
    <div className="space-y-3">
      {[1,2,3].map(i => <SkeletonCard key={i} rows={2} />)}
    </div>
  ),
}

function ViewSkeleton({ type = 'default', count }) {
  const Skeleton = SKELETONS[type] || SKELETONS.default
  return (
    <div className="max-w-2xl mx-auto pt-2 space-y-3">
      {/* Header placeholder */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1.5">
          <SkeletonLine width="w-28" height="h-5" />
          <SkeletonLine width="w-16" height="h-3" />
        </div>
        <div className="w-24 h-9 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--border)' }} />
      </div>
      <Skeleton />
    </div>
  )
}

export default memo(ViewSkeleton)
