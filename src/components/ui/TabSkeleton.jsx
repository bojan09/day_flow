// Component: TabSkeleton
// Purpose: Skeleton loading state shown while lazy-loaded tab chunks are fetching.
//          Matches the visual rhythm of the content it replaces — no jarring flash.
export default function TabSkeleton() {
  const pulse = { animation: 'pulse 1.5s ease-in-out infinite' }

  return (
    <div className="max-w-2xl mx-auto pt-2 space-y-3">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 rounded-xl" style={{ backgroundColor: 'var(--border)', ...pulse }} />
        <div className="h-8 w-20 rounded-full" style={{ backgroundColor: 'var(--border)', ...pulse }} />
      </div>

      {/* Card skeletons */}
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="rounded-2xl border p-5 space-y-3"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor:     'var(--border)',
            animationDelay:  `${i * 80}ms`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl" style={{ backgroundColor: 'var(--border)', ...pulse }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 rounded-lg w-3/4" style={{ backgroundColor: 'var(--border)', ...pulse }} />
              <div className="h-3 rounded-lg w-1/2" style={{ backgroundColor: 'var(--border)', opacity: 0.6, ...pulse }} />
            </div>
          </div>
          {i === 1 && (
            <div className="space-y-2 pt-1">
              {[1,2].map(j => (
                <div key={j} className="h-3 rounded-lg" style={{
                  backgroundColor: 'var(--border)',
                  width: j === 1 ? '100%' : '80%',
                  opacity: 0.5,
                  ...pulse,
                }} />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Tall skeleton for analytics-type tabs */}
      <div
        className="rounded-2xl border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', height: '200px', ...pulse }}
      />
    </div>
  )
}
