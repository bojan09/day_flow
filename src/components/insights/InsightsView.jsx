// Component: InsightsView
// Purpose: Insights tab — mood, yearly chain, personal best, streaks, analytics, theme, export, voice
import MoodTracker       from './MoodTracker'
import MoodChart         from './MoodChart'
import StreakBoard        from './StreakBoard'
import AnalyticsPanel    from './AnalyticsPanel'
import ReflectionPrompt  from './ReflectionPrompt'
import ThemePicker       from './ThemePicker'
import YearlyChain       from '../chain/YearlyChain'
import WeeklyPersonalBest from './WeeklyPersonalBest'
import VoiceJournal      from '../voice/VoiceJournal'
import ExportPanel       from '../export/ExportPanel'

export default function InsightsView({ mood, habits, tasks, notes, theme, onSetTheme, onWriteNote, intentions, xp }) {
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
      <ThemePicker theme={theme} onSetTheme={onSetTheme} />
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-ink-faint mb-3 px-1">Data & Notifications</p>
        <ExportPanel tasks={tasks} notes={notes} habits={habits}
          moods={mood.moods} intentions={intentions} />
      </div>
    </div>
  )
}
