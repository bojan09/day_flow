// Component: ProjectsView
// Purpose: Lightweight project grouping — each project shows task progress and linked tasks
import { useState } from 'react'
import Card   from '../ui/Card'
import Modal  from '../ui/Modal'
import Input  from '../ui/Input'
import EmptyState from '../ui/EmptyState'
import { PROJECT_STATUSES, PROJECT_CATEGORIES } from '../../hooks/useProjects'

const STATUS_COLORS = {
  Active:   'bg-forest-50 text-forest-700 border-forest-200',
  'On Hold':'bg-amber-50  text-amber-700  border-amber-200',
  Done:     'bg-stone-100 text-stone-500  border-stone-200',
}

const PROJECT_COLORS = ['#3B6B4B','#3B82F6','#8B5CF6','#EC4899','#F59E0B','#06B6D4','#C4622D']

function ProjectCard({ project, projects, tasks }) {
  const [expanded, setExpanded] = useState(false)
  const progress     = projects.getProgress(project.id, tasks.tasks)
  const taskCount    = projects.getTaskCount(project.id, tasks.tasks)
  const projectTasks = tasks.tasks.filter(t => t.projectId === project.id)
  const done         = projectTasks.filter(t => t.completed).length

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: project.color }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-ink">{project.name}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[project.status]}`}>
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-xs text-ink-muted leading-relaxed mb-2">{project.description}</p>
            )}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: project.color }} />
              </div>
              <span className="text-xs text-ink-faint flex-shrink-0">{done}/{taskCount} tasks</span>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {PROJECT_STATUSES.map(s => (
              <button key={s} onClick={() => projects.setStatus(project.id, s)}
                title={s}
                className={`w-2 h-2 rounded-full transition-all ${project.status === s ? 'scale-150' : 'opacity-30 hover:opacity-70'}`}
                style={{ backgroundColor: s === 'Active' ? '#3B6B4B' : s === 'On Hold' ? '#F59E0B' : '#A8A29E' }} />
            ))}
            <button onClick={() => setExpanded(e => !e)}
              className="ml-1 text-[10px] text-ink-faint hover:text-ink transition-colors">
              {expanded ? '▲' : '▼'}
            </button>
            <button onClick={() => projects.deleteProject(project.id)}
              className="text-ink-faint hover:text-red-400 text-xs p-0.5 transition-colors">✕</button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-stone-50 px-4 pb-4">
          <p className="text-[10px] text-ink-faint uppercase tracking-wider mt-3 mb-2">Tasks in this project</p>
          {projectTasks.length === 0 ? (
            <p className="text-xs text-ink-faint italic">No tasks yet — assign tasks to this project from the Tasks tab.</p>
          ) : (
            <ul className="space-y-1.5">
              {projectTasks.map(t => (
                <li key={t.id} className="flex items-center gap-2">
                  <span className={`text-xs ${t.completed ? 'text-ink-faint line-through' : 'text-ink'}`}>
                    {t.completed ? '✓' : '○'} {t.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectsView({ projects, tasks }) {
  const [modal, setModal] = useState(false)
  const [form,  setForm]  = useState({ name: '', description: '', category: 'Personal', color: PROJECT_COLORS[0], dueDate: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    projects.addProject(form)
    setForm({ name: '', description: '', category: 'Personal', color: PROJECT_COLORS[0], dueDate: '' })
    setModal(false)
  }

  const active   = projects.projects.filter(p => p.status !== 'Done')
  const done     = projects.projects.filter(p => p.status === 'Done')

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{active.length} active project{active.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setModal(true)}
          className="px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors">
          + New Project
        </button>
      </div>

      {projects.projects.length === 0 ? (
        <EmptyState type="default" title="No projects yet"
          subtitle="Group related tasks into projects for better organisation."
          action="+ New Project" onAction={() => setModal(true)} />
      ) : (
        <>
          <div className="space-y-3">
            {active.map(p => <ProjectCard key={p.id} project={p} projects={projects} tasks={tasks} />)}
          </div>
          {done.length > 0 && (
            <div className="space-y-3 opacity-60">
              <p className="text-xs font-medium text-ink-faint uppercase tracking-wider">Completed</p>
              {done.map(p => <ProjectCard key={p.id} project={p} projects={projects} tasks={tasks} />)}
            </div>
          )}
        </>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Project">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Project name" placeholder="e.g. Launch personal website"
            value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
          <div>
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wide block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="What is this project about?"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-parchment text-sm text-ink outline-none resize-none focus:ring-2 focus:ring-forest-200 placeholder-ink-faint/50" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-2">Colour</p>
            <div className="flex gap-2">
              {PROJECT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-stone-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <Input label="Due date (optional)" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-ink-muted hover:bg-stone-50">Cancel</button>
            <button type="submit" disabled={!form.name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-40">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
