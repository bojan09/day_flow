// Component: TaskModalDesktop
// Purpose: Desktop task detail layout — main content left, metadata rail right.
//          Receives already-wired field values/handlers from TaskDetail.jsx —
//          this component only arranges them, it owns no state itself.
export default function TaskModalDesktop({ mainContent, metadataRail }) {
  return (
    <div className="flex gap-6 min-h-[400px]">
      <div className="flex-1 space-y-4">{mainContent}</div>
      <div className="w-56 flex-shrink-0 space-y-4 border-l pl-6" style={{ borderColor: 'var(--border-soft)' }}>
        {metadataRail}
      </div>
    </div>
  )
}
