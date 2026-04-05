// Component: InsightsView
// Purpose: Phase 3 tab — mood, streaks, analytics, reflection, and theme picker
import MoodTracker      from './MoodTracker'
import MoodChart        from './MoodChart'
import StreakBoard       from './StreakBoard'
import AnalyticsPanel   from './AnalyticsPanel'
import ReflectionPrompt from './ReflectionPrompt'
import ThemePicker      from './ThemePicker'

export default function InsightsView({ mood, habits, tasks, theme, onSetTheme, onWriteNote }) {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-2">
      {/* Daily mood + chart */}
      <MoodTracker mood={mood} />
      <MoodChart   mood={mood} />

      {/* Reflection prompt */}
      <ReflectionPrompt onWriteNote={onWriteNote} />

      {/* Habit streaks */}
      <StreakBoard habits={habits} />

      {/* Analytics */}
      <AnalyticsPanel tasks={tasks} />

      {/* Theme */}
      <ThemePicker theme={theme} onSetTheme={onSetTheme} />
    </div>
  )
}
