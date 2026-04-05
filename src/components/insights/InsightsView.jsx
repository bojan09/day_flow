// Component: InsightsView
// Purpose: Insights tab — mood, streaks, analytics, reflection, theme, export/notifications
import MoodTracker      from './MoodTracker'
import MoodChart        from './MoodChart'
import StreakBoard       from './StreakBoard'
import AnalyticsPanel   from './AnalyticsPanel'
import ReflectionPrompt from './ReflectionPrompt'
import ThemePicker      from './ThemePicker'
import ExportPanel      from '../export/ExportPanel'

const SECTIONS = [
  { id: 'mood',       label: '😌 Mood'      },
  { id: 'streaks',    label: '🔥 Streaks'   },
  { id: 'analytics',  label: '📊 Analytics' },
  { id: 'settings',   label: '⚙️ Settings'  },
]

export default function InsightsView({ mood, habits, tasks, notes, theme, onSetTheme, onWriteNote, intentions }) {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-2">
      {/* Mood */}
      <MoodTracker mood={mood} />
      <MoodChart   mood={mood} />

      {/* Daily reflection */}
      <ReflectionPrompt onWriteNote={onWriteNote} />

      {/* Habit streaks */}
      <StreakBoard habits={habits} />

      {/* Analytics */}
      <AnalyticsPanel tasks={tasks} />

      {/* Appearance */}
      <ThemePicker theme={theme} onSetTheme={onSetTheme} />

      {/* Phase 4: Export + Notifications */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-ink-faint mb-3 px-1">Data & Notifications</p>
        <ExportPanel
          tasks={tasks}
          notes={notes}
          habits={habits}
          moods={mood.moods}
          intentions={intentions}
        />
      </div>
    </div>
  )
}
