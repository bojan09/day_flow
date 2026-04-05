// Component: ExportPanel
// Purpose: Phase 4 export UI — backup to JSON, tasks to CSV, notification settings, import
import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import { exportDataAsJSON, exportTasksAsCSV } from '../../services/exportService'
import { notifications } from '../../services/notificationService'
import { storage } from '../../services/storage'

export default function ExportPanel({ tasks, notes, habits, moods, intentions }) {
  const [notifPerm,  setNotifPerm]  = useState('default')
  const [exportDone, setExportDone] = useState(null)

  useEffect(() => {
    notifications.getPermission().then(setNotifPerm)
  }, [])

  const handleRequestNotif = async () => {
    const perm = await notifications.requestPermission()
    setNotifPerm(perm)
    if (perm === 'granted') {
      notifications.send('🎉 Enabled!', 'DayFlow will remind you about tasks and habits.')
    }
  }

  const handleJSON = () => {
    exportDataAsJSON(tasks.tasks, notes.notes, habits, moods, intentions)
    setExportDone('json')
    setTimeout(() => setExportDone(null), 3000)
  }

  const handleCSV = () => {
    exportTasksAsCSV(tasks.tasks)
    setExportDone('csv')
    setTimeout(() => setExportDone(null), 3000)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.tasks)  storage.set('tasks',  data.tasks)
        if (data.notes)  storage.set('notes',  data.notes)
        if (data.habits) storage.set('habits', data.habits.list)
        if (data.moods)  storage.set('moods',  data.moods)
        alert('Data imported! Refresh to see your restored data.')
      } catch { alert('Invalid backup file.') }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-3">Notifications</p>
        {notifPerm === 'granted' ? (
          <div className="flex items-center gap-2 text-sm">
            <span>🔔</span><span className="text-forest-600 font-medium">Notifications enabled</span>
          </div>
        ) : notifPerm === 'denied' ? (
          <p className="text-sm text-ink-muted">Blocked — enable in browser settings.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-ink-muted">Get reminders for tasks, habits, and streak milestones.</p>
            <button onClick={handleRequestNotif}
              className="px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-medium hover:bg-forest-700 transition-colors">
              🔔 Enable Notifications
            </button>
          </div>
        )}
      </Card>

      <Card>
        <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-4">Export Data</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Full Backup</p>
              <p className="text-xs text-ink-faint">Tasks, notes, habits, moods — everything</p>
            </div>
            <button onClick={handleJSON}
              className="px-4 py-2 rounded-xl bg-forest-50 border border-forest-200 text-forest-700 text-xs font-medium hover:bg-forest-100 transition-colors flex-shrink-0">
              {exportDone === 'json' ? '✓ Saved!' : '↓ JSON'}
            </button>
          </div>
          <div className="border-t border-stone-100 pt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Tasks CSV</p>
              <p className="text-xs text-ink-faint">Open in Excel or Google Sheets</p>
            </div>
            <button onClick={handleCSV}
              className="px-4 py-2 rounded-xl bg-forest-50 border border-forest-200 text-forest-700 text-xs font-medium hover:bg-forest-100 transition-colors flex-shrink-0">
              {exportDone === 'csv' ? '✓ Saved!' : '↓ CSV'}
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-medium uppercase tracking-wider text-ink-faint mb-2">Restore Backup</p>
        <p className="text-sm text-ink-muted mb-3">Restore from a DayFlow JSON file.</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-parchment border border-stone-200 text-sm text-ink-muted hover:bg-stone-50 cursor-pointer transition-colors">
          ↑ Choose file
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
      </Card>
    </div>
  )
}
