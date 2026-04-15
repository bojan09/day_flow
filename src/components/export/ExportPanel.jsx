// Component: ExportPanel
// Purpose: Notifications (browser + push), export JSON/CSV, import backup
import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import PushSetupPanel from '../notifications/PushSetupPanel'
import { exportDataAsJSON, exportTasksAsCSV } from '../../services/exportService'
import { notifications } from '../../services/notificationService'
import { storage } from '../../services/storage'

export default function ExportPanel({ tasks, notes, habits, moods, intentions }) {
  const [notifPerm,  setNotifPerm]  = useState('default')
  const [exportDone, setExportDone] = useState(null)

  useEffect(() => { notifications.getPermission().then(setNotifPerm) }, [])

  const handleRequestNotif = async () => {
    const perm = await notifications.requestPermission()
    setNotifPerm(perm)
    if (perm === 'granted') notifications.send('🎉 Enabled!', 'DayFlow will send you reminders.')
  }

  const handleJSON = () => {
    exportDataAsJSON(tasks.tasks, notes.notes, habits, moods, intentions)
    setExportDone('json'); setTimeout(() => setExportDone(null), 3000)
  }

  const handleCSV = () => {
    exportTasksAsCSV(tasks.tasks)
    setExportDone('csv'); setTimeout(() => setExportDone(null), 3000)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.tasks)   storage.set('tasks',  data.tasks)
        if (data.notes)   storage.set('notes',  data.notes)
        if (data.habits)  storage.set('habits', data.habits.list || data.habits)
        if (data.moods)   storage.set('moods',  data.moods)
        alert('Data imported! Refresh to see your restored data.')
      } catch { alert('Invalid backup file.') }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      {/* Web push (Supabase-backed) */}
      <PushSetupPanel />

      {/* Browser notifications fallback */}
      <Card>
        <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)' }}>
          🔔 Browser Notifications
        </p>
        {notifPerm === 'granted' ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--accent)' }}>
            <span>✓</span><span className="font-medium">Enabled</span>
          </div>
        ) : notifPerm === 'denied' ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Blocked — enable in browser settings.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>In-app reminders while DayFlow is open.</p>
            <button onClick={handleRequestNotif}
              className="px-4 py-2 rounded-full text-white text-sm font-medium transition-all"
              style={{ backgroundColor: 'var(--accent)' }}>
              Enable
            </button>
          </div>
        )}
      </Card>

      {/* Export */}
      <Card>
        <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
          Export Data
        </p>
        <div className="space-y-3">
          {[
            { label: 'Full Backup', sub: 'Tasks, notes, habits, moods — everything', key: 'json', fn: handleJSON },
            { label: 'Tasks CSV',   sub: 'Open in Excel or Google Sheets',           key: 'csv',  fn: handleCSV  },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{item.sub}</p>
              </div>
              <button onClick={item.fn}
                className="px-4 py-2 rounded-xl border text-xs font-medium transition-colors flex-shrink-0"
                style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)', color: 'var(--accent)' }}>
                {exportDone === item.key ? '✓ Saved!' : '↓ Download'}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Import */}
      <Card>
        <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>
          Restore Backup
        </p>
        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Restore from a DayFlow JSON backup.</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm cursor-pointer transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
          ↑ Choose file
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
      </Card>
    </div>
  )
}
