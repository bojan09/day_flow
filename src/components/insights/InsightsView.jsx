// Component: InsightsView
// Purpose: Full Insights tab — mood, smart streaks, advanced analytics, AI coach,
//          achievements, theme, export. BalanceWheel lives in its own Balance tab.
import MoodTracker       from './MoodTracker'
import MoodChart         from './MoodChart'
import ReflectionPrompt  from './ReflectionPrompt'
import YearlyChain       from '../chain/YearlyChain'
import WeeklyPersonalBest from './WeeklyPersonalBest'
import AnalyticsPanel    from './AnalyticsPanel'
import SmartStreakBoard  from './SmartStreakBoard'
import AdvancedAnalytics from './AdvancedAnalytics'
import AchievementsView  from './AchievementsView'
import AICoach           from './AICoach'
import VoiceJournal      from '../voice/VoiceJournal'
import ThemePicker       from './ThemePicker'
import ExportPanel       from '../export/ExportPanel'

export default function InsightsView({
  mood, habits, tasks, notes, goals,
  theme, onSetTheme, onWriteNote,
  intentions, xp, achievements, energy,
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pt-2">

      {/* Daily mood + chart */}
      <MoodTracker mood={mood} />
      <MoodChart   mood={mood} />

      {/* Smart streak system */}
      <SmartStreakBoard habits={habits} />

      {/* Yearly activity chain */}
      <YearlyChain tasks={tasks} habits={habits} mood={mood} />

      {/* Weekly personal best */}
      <WeeklyPersonalBest tasks={tasks} habits={habits} />

      {/* Reflection prompt */}
      <ReflectionPrompt onWriteNote={onWriteNote} />

      {/* Advanced analytics (energy, burnout, behaviour) */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest mb-3 px-1"
          style={{ color: 'var(--text-faint)' }}>
          Advanced Analytics
        </p>
        <AdvancedAnalytics tasks={tasks} mood={mood} energy={energy} habits={habits} />
      </div>

      {/* Achievements */}
      {achievements && (
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-3 px-1"
            style={{ color: 'var(--text-faint)' }}>
            Achievements
          </p>
          <AchievementsView achievements={achievements} xp={xp} />
        </div>
      )}

      {/* AI Coach */}
      {goals && (
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-3 px-1"
            style={{ color: 'var(--text-faint)' }}>
            AI Features
          </p>
          <AICoach tasks={tasks} habits={habits} mood={mood} notes={notes} goals={goals} />
        </div>
      )}

      {/* Voice journal */}
      <VoiceJournal notes={notes} xp={xp} />

      {/* Appearance */}
      <ThemePicker theme={theme} onSetTheme={onSetTheme} />

      {/* Export & notifications */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest mb-3 px-1"
          style={{ color: 'var(--text-faint)' }}>
          Data &amp; Notifications
        </p>
        <ExportPanel tasks={tasks} notes={notes} habits={habits}
          moods={mood.moods} intentions={intentions} />
      </div>
    </div>
  )
}
