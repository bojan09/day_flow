// Component: ExportPanel
// Purpose: Full data export (per-type CSV + full JSON backup) and safe import.
//          Import validates the file and previews counts before restoring.
import { useState, useRef } from 'react'
import {
  exportTasksAsCSV, exportHabitsAsCSV, exportHabitLogAsCSV,
  exportMoodsAsCSV, exportNotesAsCSV, exportGoalsAsCSV,
  exportWorkoutsAsCSV, exportFullBackup, validateBackup,
} from '../../services/exportService'
import { storage } from '../../services/storage'

function ExportRow({ emoji, label, sub, onExport, done }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b last:border-0"
      style={{ borderColor: 'var(--border-soft)' }}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg flex-shrink-0">{emoji}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{label}</p>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{sub}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onExport}
        className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95"
        style={done
          ? { backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)', color: 'var(--accent-text)' }
          : { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
        }
      >
        {done ? '✓ Saved' : '↓ CSV'}
      </button>
    </div>
  )
}

export default function ExportPanel({
  tasks, notes, habits, moods, intentions,
  goals, workouts, ideas, bookmarks, water, energy,
}) {
  const [done,      setDone]      = useState({})
  const [importing, setImporting] = useState(false)
  const [preview,   setPreview]   = useState(null)   // validated backup data
  const [importErr, setImportErr] = useState(null)
  const [imported,  setImported]  = useState(false)
  const fileRef = useRef(null)

  const markDone = (key) => {
    setDone(d => ({ ...d, [key]: true }))
    setTimeout(() => setDone(d => ({ ...d, [key]: false })), 3000)
  }

  const EXPORTS = [
    {
      key: 'tasks', emoji: '✅', label: 'Tasks',
      sub:    `${tasks?.tasks?.length || 0} tasks — all fields including priority, date, category`,
      onExport: () => { exportTasksAsCSV(tasks?.tasks); markDone('tasks') },
    },
    {
      key: 'habits', emoji: '🔁', label: 'Habits',
      sub:    `${habits?.habits?.length || 0} habits with definitions`,
      onExport: () => { exportHabitsAsCSV(habits?.habits, habits?.log); markDone('habits') },
    },
    {
      key: 'habitlog', emoji: '📋', label: 'Habit Log',
      sub:    'Full completion history per habit per day',
      onExport: () => { exportHabitLogAsCSV(habits?.habits, habits?.log); markDone('habitlog') },
    },
    {
      key: 'moods', emoji: '😊', label: 'Mood Log',
      sub:    `${Object.keys(moods || {}).length} entries — score, label, note`,
      onExport: () => { exportMoodsAsCSV(moods); markDone('moods') },
    },
    {
      key: 'notes', emoji: '📝', label: 'Notes',
      sub:    `${notes?.notes?.length || 0} notes — title, content, tags`,
      onExport: () => { exportNotesAsCSV(notes?.notes); markDone('notes') },
    },
    {
      key: 'goals', emoji: '🏆', label: 'Goals',
      sub:    `${goals?.goals?.length || 0} goals with milestone counts`,
      onExport: () => { exportGoalsAsCSV(goals?.goals); markDone('goals') },
    },
    {
      key: 'workouts', emoji: '🏋️', label: 'Workouts',
      sub:    `${workouts?.sessions?.length || 0} sessions`,
      onExport: () => { exportWorkoutsAsCSV(workouts?.sessions); markDone('workouts') },
    },
  ]

  // ── Full backup ─────────────────────────────────────────────────────────────
  const handleFullBackup = () => {
    exportFullBackup({ tasks, notes, habits, moods, intentions,
                       goals, workouts, ideas, bookmarks, water, energy })
    markDone('backup')
  }

  // ── Import: read + validate + show preview ──────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportErr(null); setPreview(null); setImported(false)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = validateBackup(ev.target.result)
      if (!result.ok) {
        setImportErr(result.error)
      } else {
        setPreview(result)
      }
    }
    reader.readAsText(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const confirmImport = () => {
    if (!preview?.data) return
    setImporting(true)
    try {
      const d = preview.data
      if (d.tasks)         storage.set('tasks',    d.tasks)
      if (d.notes)         storage.set('notes',    d.notes)
      if (d.habits?.list)  storage.set('habits',   d.habits.list)
      if (d.habits?.log)   storage.set('habit_log',d.habits.log)
      if (d.moods)         storage.set('moods',    d.moods)
      if (d.goals)         storage.set('goals',    d.goals)
      if (d.workouts)      storage.set('workouts', d.workouts)
      if (d.ideas)         storage.set('ideas',    d.ideas)
      if (d.bookmarks)     storage.set('bookmarks',d.bookmarks)
      setImported(true); setPreview(null)
    } catch (err) {
      setImportErr('Import failed: ' + err.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Full backup — primary action */}
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              📦 Full Backup (JSON)
            </p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Everything — tasks, habits, notes, goals, workouts, moods, ideas, bookmarks.
              Use this to migrate between accounts or restore after data loss.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFullBackup}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ backgroundColor: done.backup ? '#10B981' : 'var(--accent)' }}
          >
            {done.backup ? '✓ Saved!' : '↓ Download'}
          </button>
        </div>
      </div>

      {/* Per-type CSV exports */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
            Export as CSV
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
            Open in Excel, Google Sheets, or Numbers
          </p>
        </div>
        <div className="px-5 pb-4">
          {EXPORTS.map(ex => (
            <ExportRow key={ex.key} {...ex} done={!!done[ex.key]} />
          ))}
        </div>
      </div>

      {/* Import */}
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: 'var(--text-faint)' }}>
          Restore Backup
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Restore from a DayFlow JSON backup file. Existing local data will be overwritten.
          Requires a page refresh after import.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />

        {!preview && !imported && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2.5 rounded-xl border text-sm font-medium transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}
          >
            ↑ Choose backup file
          </button>
        )}

        {/* Validation error */}
        {importErr && (
          <div className="mt-3 px-4 py-3 rounded-xl border text-sm"
            style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }}>
            ⚠️ {importErr}
          </div>
        )}

        {/* Preview before confirming */}
        {preview && (
          <div className="mt-3 space-y-3">
            <div
              className="px-4 py-3 rounded-xl border"
              style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--accent-text)' }}>
                ✓ Valid backup — {preview.exportedAt ? new Date(preview.exportedAt).toLocaleDateString() : 'unknown date'}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(preview.counts).map(([k, v]) => (
                  <p key={k} className="text-xs" style={{ color: 'var(--accent-text)' }}>
                    {v} {k}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex-1 py-2 rounded-xl border text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmImport}
                disabled={importing}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {importing ? 'Restoring…' : 'Restore now'}
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {imported && (
          <div className="mt-3 space-y-3">
            <div
              className="px-4 py-3 rounded-xl border text-sm"
              style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)', color: 'var(--accent-text)' }}
            >
              ✓ Data restored successfully. Refresh the page to see your data.
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Refresh now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
