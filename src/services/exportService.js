// Service: exportService
// Purpose: Export all user data as a JSON backup file
import { format } from 'date-fns'

export function exportDataAsJSON(tasks, notes, habits, moods, intentions) {
  const payload = {
    exportedAt: new Date().toISOString(),
    version:    '1.0',
    tasks,
    notes,
    habits:     { list: habits.habits, log: habits.log },
    moods,
    intentions,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `dayflow-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportTasksAsCSV(tasks) {
  const headers = ['Title','Priority','Category','Date','Completed','EstimateMins']
  const rows    = tasks.map(t => [
    `"${t.title.replace(/"/g, '""')}"`,
    t.priority,
    t.category,
    t.date,
    t.completed ? 'Yes' : 'No',
    t.estimateMins || '',
  ])
  const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `dayflow-tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
