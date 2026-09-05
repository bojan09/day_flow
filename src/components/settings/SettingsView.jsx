// Component: SettingsView
// Purpose: Appearance, notifications, and data export.
//
// These lived as a fourth tab inside Insights, which meant looking under
// analytics to change a theme or turn notifications on. Settings is not an
// insight, so it now has its own destination.
import { useBookmarks } from '../../hooks/useBookmarks'
import ThemePicker      from '../insights/ThemePicker'
import PushSetupPanel   from '../notifications/PushSetupPanel'
import ExportPanel      from '../export/ExportPanel'

export default function SettingsView({
  theme, onSetTheme, moodTheme,
  tasks, habits, mood, notes, goals, intentions, workouts, ideas, energy,
}) {
  // Owned here rather than at the DashboardPage root — see CaptureView.
  const bookmarks = useBookmarks()

  return (
    <div className="max-w-2xl mx-auto pt-2">
  <div className="space-y-4">
    <ThemePicker theme={theme} onSetTheme={onSetTheme} />

    {/* Was built but never mounted, so nothing ever asked for notification
        permission and no reminder could fire. */}
    <PushSetupPanel />

    {moodTheme && (
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              😊 Mood-Responsive UI
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Subtly tints the interface based on your daily mood
            </p>
          </div>
          <button
            onClick={() => moodTheme.setEnabled(e => !e)}
            className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
            style={{ backgroundColor: moodTheme.enabled ? 'var(--accent)' : 'var(--border)' }}
            aria-label="Toggle mood-responsive UI"
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200"
              style={{
                backgroundColor: 'var(--surface-raised)',
                transform: moodTheme.enabled ? 'translateX(22px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>
      </div>
    )}

    <div>
      <p className="text-xs font-medium uppercase tracking-widest mb-3 px-1"
        style={{ color: 'var(--text-faint)' }}>
        Data &amp; Notifications
      </p>
      <ExportPanel
        tasks={tasks}        notes={notes}
        habits={habits}      moods={mood.moods}
        intentions={intentions} goals={goals}
        workouts={workouts}  ideas={ideas}
        bookmarks={bookmarks}
        energy={energy}
      />
    </div>
  </div>
    </div>
  )
}
