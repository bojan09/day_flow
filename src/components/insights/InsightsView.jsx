// Component: InsightsView
// Purpose: Full Insights tab with 4 sub-tabs:
//          Overview / Trends / Habits / Settings
//          Each tab focuses on a different dimension of insight.
import { useState } from 'react'
import MoodTracker           from './MoodTracker'
import MoodChart             from './MoodChart'
import AnalyticsPanel        from './AnalyticsPanel'
import SmartStreakBoard      from './SmartStreakBoard'
import AdvancedAnalytics     from './AdvancedAnalytics'
import ProductivityHeatmap   from './ProductivityHeatmap'
import CategoryTrends        from './CategoryTrends'
import WeeklyMonthlyComparison from './WeeklyMonthlyComparison'
import YearlyChain           from '../chain/YearlyChain'
import WeeklyPersonalBest    from './WeeklyPersonalBest'
import ReflectionPrompt      from './ReflectionPrompt'
import DailySummaryCard      from '../summary/DailySummaryCard'
import VoiceJournal          from '../voice/VoiceJournal'

const TABS = [
  { id: 'overview',  label: 'Overview',  emoji: '📊' },
  { id: 'trends',    label: 'Trends',    emoji: '📈' },
  { id: 'habits',    label: 'Habits',    emoji: '🔁' },
]

export default function InsightsView({
  mood, habits, tasks, notes, onWriteNote, energy,
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
          <DailySummaryCard tasks={tasks} habits={habits} mood={mood} />
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


          <VoiceJournal notes={notes} />
        </div>
      )}

      {/* ── Settings tab ───────────────────────────────────────────────── */}
    </div>
  )
}
