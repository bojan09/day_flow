// Hook: useTemplates
// Purpose: Save and apply reusable task template sets
import { useState, useEffect } from 'react'
import { storage } from '../services/storage'

const KEY = 'task_templates'

export function useTemplates() {
  const [templates, setTemplates] = useState(() => storage.get(KEY, []))
  useEffect(() => { storage.set(KEY, templates) }, [templates])

  const saveTemplate = (name, tasks) => {
    const tmpl = {
      id:        Date.now().toString(),
      name:      name.trim(),
      tasks:     tasks.map(t => ({ title: t.title, priority: t.priority, category: t.category, estimateMins: t.estimateMins })),
      createdAt: new Date().toISOString(),
    }
    setTemplates(prev => [tmpl, ...prev])
    return tmpl
  }

  const deleteTemplate = (id)   => setTemplates(prev => prev.filter(t => t.id !== id))

  // Returns array of task-like objects caller can pass to addTask
  const applyTemplate  = (tmpl, date) =>
    tmpl.tasks.map(t => ({ ...t, date }))

  return { templates, saveTemplate, deleteTemplate, applyTemplate }
}
