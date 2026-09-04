// Component: TaskModalMobile
// Purpose: Mobile task detail layout — full-screen, tabbed Details/Subtasks.
import { useState } from 'react'

export default function TaskModalMobile({ detailsContent, subtasksContent }) {
  const [tab, setTab] = useState('details')
  return (
    <div className="min-h-[70vh] flex flex-col">
      <div className="flex gap-1 border-b mb-4" style={{ borderColor: 'var(--border-soft)' }}>
        {[['details', 'Details'], ['subtasks', 'Subtasks']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
            style={{
              borderColor: tab === id ? 'var(--accent)' : 'transparent',
              color: tab === id ? 'var(--accent-text)' : 'var(--text-muted)',
            }}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'details' ? detailsContent : subtasksContent}
      </div>
    </div>
  )
}
