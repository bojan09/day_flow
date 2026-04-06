// Component: TaskTemplates
// Purpose: Save current today's tasks as a reusable template and apply templates to any date
import { useState } from 'react'
import Card  from '../ui/Card'
import Modal from '../ui/Modal'
import { getTodayKey } from '../../utils/dateUtils'

export default function TaskTemplates({ templates, tasks }) {
  const [modal,    setModal]    = useState(false)
  const [name,     setName]     = useState('')
  const [applyId,  setApplyId]  = useState(null)
  const [applyDate,setApplyDate]= useState(getTodayKey())

  const todayTasks = tasks.getTodayTasks().filter(t => !t.isRecurring)

  const handleSave = (e) => {
    e.preventDefault()
    if (!name.trim() || !todayTasks.length) return
    templates.saveTemplate(name, todayTasks)
    setName('')
    setModal(false)
  }

  const handleApply = (tmpl) => {
    const taskList = templates.applyTemplate(tmpl, applyDate)
    taskList.forEach(t => tasks.addTask(t))
    setApplyId(null)
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">📋 Task Templates</p>
          {todayTasks.length > 0 && (
            <button onClick={() => setModal(true)}
              className="text-xs text-forest-500 hover:text-forest-700 font-medium transition-colors">
              Save today's tasks →
            </button>
          )}
        </div>

        {templates.templates.length === 0 ? (
          <p className="text-xs text-ink-faint italic">
            No templates yet. Add tasks to today then save them as a template.
          </p>
        ) : (
          <div className="space-y-2">
            {templates.templates.map(tmpl => (
              <div key={tmpl.id} className="flex items-center gap-2 group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{tmpl.name}</p>
                  <p className="text-[10px] text-ink-faint">{tmpl.tasks.length} task{tmpl.tasks.length !== 1 ? 's' : ''}</p>
                </div>
                {applyId === tmpl.id ? (
                  <div className="flex items-center gap-1.5">
                    <input type="date" value={applyDate}
                      onChange={e => setApplyDate(e.target.value)}
                      className="text-[11px] border border-stone-200 rounded-lg px-1.5 py-1 outline-none text-ink-muted w-28" />
                    <button onClick={() => handleApply(tmpl)}
                      className="text-[10px] px-2 py-1 rounded-full bg-forest-500 text-white hover:bg-forest-700 transition-colors">
                      Apply
                    </button>
                    <button onClick={() => setApplyId(null)}
                      className="text-[10px] text-ink-faint hover:text-ink">✕</button>
                  </div>
                ) : (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setApplyId(tmpl.id)}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-forest-50 text-forest-700 border border-forest-200 hover:bg-forest-100 transition-colors">
                      Apply
                    </button>
                    <button onClick={() => templates.deleteTemplate(tmpl.id)}
                      className="text-ink-faint hover:text-red-400 text-xs p-1 transition-colors">✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Save as Template">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5">Template name</p>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus
              placeholder="e.g. Monday morning routine"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-parchment text-sm outline-none focus:ring-2 focus:ring-forest-200 text-ink" />
          </div>
          <div>
            <p className="text-xs text-ink-faint mb-2">Tasks to save ({todayTasks.length}):</p>
            <ul className="space-y-1">
              {todayTasks.map(t => (
                <li key={t.id} className="text-xs text-ink-muted flex items-center gap-2">
                  <span className="text-stone-300">·</span>{t.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm text-ink-muted">Cancel</button>
            <button type="submit" disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-40">Save Template</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
