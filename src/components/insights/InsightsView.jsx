// Component: InsightsView
// Purpose: Full Insights tab with 4 sub-tabs:
//          Overview / Trends / Habits / Settings
//          Each tab focuses on a different dimension of insight.
import { useState } from 'react'
import MoodTracker           from './MoodTracker'
import MoodChart             from './MoodChart'
import AnalyticsPanel        from './AnalyticsPanel'
import SmartStreakBoard      from './SmartStreakBoard'
import HabitLoopOptimizer  from '../habits/HabitLoopOptimizer'
import AdvancedAnalytics     from './AdvancedAnalytics'
import AchievementsView      from './AchievementsView'
import AICoach               from './AICoach'
import ProductivityHeatmap   from './ProductivityHeatmap'
import CategoryTrends        from './CategoryTrends'
import WeeklyMonthlyComparison from './WeeklyMonthlyComparison'
import YearlyChain           from '../chain/YearlyChain'
import WeeklyPersonalBest    from './WeeklyPersonalBest'
import ReflectionPrompt      from './ReflectionPrompt'
import DailySummaryCard      from '../summary/DailySummaryCard'
import AIDailyFeedback       from '../summary/AIDailyFeedback'
import VoiceJournal          from '../voice/VoiceJournal'
import ThemePicker           from './ThemePicker'
import ExportPanel           from '../export/ExportPanel'

const TABS = [
  { id: 'overview',  label: 'Overview',  emoji: '📊' },
  { id: 'trends',    label: 'Trends',    emoji: '📈' },
  { id: 'habits',    label: 'Habits',    emoji: '🔁' },
  { id: 'settings',  label: 'Settings',  emoji: '⚙️' },
]

export default function InsightsView({
  mood, habits, tasks, notes, goals,
  theme, onSetTheme, onWriteNote,
  intentions, xp, achievements, energy, water,
  moodTheme, workouts, ideas, bookmarks,
}) {
  const [tab, setTab] = useState('overview')

  return (
    <div className="max-w-2xl mx-auto pt-2 space-y-4">

      {/* Sub-tab bar */}
      <div
        className="flex gap-0.5 rounded-xl p-0.5 sticky top-0 z-10"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
            style={tab === t.id
              ? { backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)', color: 'var(--text)' }
              : { color: 'var(--text-faint)' }
            }
          >
            <span>{t.emoji}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Overview tab ───────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <DailySummaryCard tasks={tasks} habits={habits} mood={mood} water={water} xp={xp} />
          <AIDailyFeedback  tasks={tasks} habits={habits} mood={mood} water={water} />
          <MoodTracker mood={mood} />
          <AnalyticsPanel  tasks={tasks} />
          <WeeklyPersonalBest tasks={tasks} habits={habits} />
          <ReflectionPrompt onWriteNote={onWriteNote} />
        </div>
      )}

      {/* ── Trends tab ─────────────────────────────────────────────────── */}
      {tab === 'trends' && (
        <div className="space-y-4">
          <ProductivityHeatmap tasks={tasks} habits={habits} />
          <MoodChart mood={mood} />
          <WeeklyMonthlyComparison tasks={tasks} habits={habits} mood={mood} />
          <CategoryTrends tasks={tasks} />
          <YearlyChain tasks={tasks} habits={habits} mood={mood} />
          <AdvancedAnalytics tasks={tasks} mood={mood} energy={energy} habits={habits} />
        </div>
      )}

      {/* ── Habits tab ─────────────────────────────────────────────────── */}
      {tab === 'habits' && (
        <div className="space-y-4">
          <SmartStreakBoard habits={habits} />
          <HabitLoopOptimizer habits={habits} />

          {achievements && (
            <>
              <p className="text-xs font-medium uppercase tracking-widest px-1"
                style={{ color: 'var(--text-faint)' }}>
                Achievements
              </p>
              <AchievementsView achievements={achievements} xp={xp} />
            </>
          )}

          {goals && (
            <>
              <p className="text-xs font-medium uppercase tracking-widest px-1"
                style={{ color: 'var(--text-faint)' }}>
                AI Coaching
              </p>
              <AICoach tasks={tasks} habits={habits} mood={mood} notes={notes} goals={goals} />
            </>
          )}

          <VoiceJournal notes={notes} xp={xp} />
        </div>
      )}

      {/* ── Settings tab ───────────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="space-y-4">
          <ThemePicker theme={theme} onSetTheme={onSetTheme} />

          {moodTheme && (
            <div
              className="rounded-2xl border p-5"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
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
                    className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform bg-white duration-200"
                    style={{ transform: moodTheme.enabled ? 'translateX(22px)' : 'translateX(2px)' }}
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
              bookmarks={bookmarks} water={water}
              energy={energy}
            />
          </div>
        </div>
      )}
    </div>
  )
}
