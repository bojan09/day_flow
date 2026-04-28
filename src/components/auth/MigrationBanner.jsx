// Component: MigrationBanner
// Purpose: One-time offer to import localStorage data after first login.
//          Uses a user-specific key so it never appears again after dismiss or import.
import { useState } from 'react'
import { hasLocalData, hasMigrated, migrateToSupabase } from '../../services/migrationService'
import { isSupabaseConfigured } from '../../services/supabaseClient'

function getDismissedKey(userId) {
  return `dayflow_migration_dismissed_${userId}`
}

export default function MigrationBanner({ userId }) {
  const [visible, setVisible] = useState(() => {
    if (!isSupabaseConfigured() || !userId) return false
    if (hasMigrated()) return false
    if (!hasLocalData()) return false
    // Check user-specific dismiss flag
    try {
      if (localStorage.getItem(getDismissedKey(userId))) return false
    } catch {}
    return true
  })
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  if (!visible) return null

  const dismiss = () => {
    try { localStorage.setItem(getDismissedKey(userId), '1') } catch {}
    setVisible(false)
  }

  const handleMigrate = async () => {
    setLoading(true)
    const result = await migrateToSupabase(userId)
    setLoading(false)
    if (result.success || result.skipped) {
      setDone(true)
      try { localStorage.setItem(getDismissedKey(userId), '1') } catch {}
      setTimeout(() => setVisible(false), 3000)
    }
  }

  return (
    <div
      className="mx-4 sm:mx-6 md:mx-8 mt-4 rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-fade-down"
      style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent-mid)' }}
    >
      {done ? (
        <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
          ✓ Your local data has been synced to your account!
        </p>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              Welcome! We found local data
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>
              Import your existing tasks, notes, and habits so they sync across all devices.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleMigrate}
              disabled={loading}
              className="px-4 py-2 rounded-full text-white text-xs font-medium transition-all active:scale-95"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading ? 'Importing…' : 'Import data →'}
            </button>
            <button
              onClick={dismiss}
              className="text-xs px-2 transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              Dismiss
            </button>
          </div>
        </>
      )}
    </div>
  )
}
