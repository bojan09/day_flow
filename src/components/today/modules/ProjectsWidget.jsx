// Component: ProjectsWidget
// Purpose: Mini Today dashboard card — shows active projects with task counts.
//          Tapping a project navigates to the Projects tab.
import { memo } from 'react'
import AnimatedBar from '../../ui/AnimatedBar'

function ProjectsWidget({ projects, tasks, onTabChange }) {
  const active = (projects?.projects || []).filter(p => !p.completed).slice(0, 4)

  if (active.length === 0) return (
    <div className="px-4 py-3 text-center">
      <p className="text-sm italic" style={{ color: 'var(--text-faint)' }}>No active projects</p>
      <button type="button" onClick={() => onTabChange?.('projects')}
        className="mt-2 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
        + New project
      </button>
    </div>
  )

  return (
    <div className="space-y-2.5 px-4 pb-3">
      {active.map(p => {
        const projectTasks = (tasks?.tasks || []).filter(t => t.projectId === p.id)
        const done  = projectTasks.filter(t => t.completed).length
        const total = projectTasks.length
        const pct   = total > 0 ? Math.round((done / total) * 100) : 0

        return (
          <button type="button" key={p.id}
            onClick={() => onTabChange?.('projects')}
            className="w-full text-left transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.color || 'var(--accent)' }} />
                <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                  {p.name}
                </span>
              </div>
              <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--text-faint)' }}>
                {done}/{total}
              </span>
            </div>
            <AnimatedBar pct={pct} color={p.color || 'var(--accent)'} height="h-1.5" />
          </button>
        )
      })}
      <button type="button" onClick={() => onTabChange?.('projects')}
        className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
        View all projects →
      </button>
    </div>
  )
}

export default memo(ProjectsWidget)
