// Component: InsightsView
// Purpose: Pure analytics tab — mood, streaks, chains, analytics, voice, theme, export.
//          BalanceWheel lives in BalanceView (its own tab) — not here.
import MoodTracker        from './MoodTracker'
import MoodChart          from './MoodChart'
import StreakBoard         from './StreakBoard'
import AnalyticsPanel     from './AnalyticsPanel'
import ReflectionPrompt   from './ReflectionPrompt'
import ThemePicker        from './ThemePicker'
import YearlyChain        from '../chain/YearlyChain'
import WeeklyPersonalBest from './WeeklyPersonalBest'
import VoiceJournal       from '../voice/VoiceJournal'
import ExportPanel        from '../export/ExportPanel'

export default function InsightsView({
  mood, habits, tasks, notes,
  theme, onSetTheme,
  onWriteNote, intentions, xp,
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-2">
      <MoodTracker mood={mood} />
      <MoodChart   mood={mood} />
      <ReflectionPrompt onWriteNote={onWriteNote} />
      <YearlyChain tasks={tasks} habits={habits} mood={mood} />
      <WeeklyPersonalBest tasks={tasks} habits={habits} />
      <StreakBoard  habits={habits} />
      <AnalyticsPanel tasks={tasks} />
      <VoiceJournal notes={notes} xp={xp} />
      <ThemePicker  theme={theme} onSetTheme={onSetTheme} />
      <div>
        <p
          className="text-xs font-medium uppercase tracking-widest mb-3 px-1"
          style={{ color: 'var(--text-faint)' }}
        >
          Data &amp; Notifications
        </p>
        <ExportPanel
          tasks={tasks} notes={notes}
          habits={habits} moods={mood.moods}
          intentions={intentions}
        />
      </div>
    </div>
  )
}
