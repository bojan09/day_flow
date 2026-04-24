// Component: TodayView
// Purpose: Adaptive daily command center.
//          Phase 4.1: collapsible widgets, larger tap targets, swipe week navigation.
import GoodMorningHeader  from './GoodMorningHeader'
import EnergyCheckIn      from './EnergyCheckIn'
import AffirmationsCard   from '../affirmations/AffirmationsCard'
import FocusTask          from './FocusTask'
import ProgressRing       from './ProgressRing'
import TodayTaskList      from './TodayTaskList'
import TodayHabitStrip    from './TodayHabitStrip'
import TodayQuickNote     from './TodayQuickNote'
import WeekStrip          from './WeekStrip'
import MoodTracker        from '../insights/MoodTracker'
import GratitudeLog       from '../gratitude/GratitudeLog'
import EndOfDayReview     from '../summary/EndOfDayReview'
import WaterTracker       from '../water/WaterTracker'
import DailyScore         from '../score/DailyScore'
import MonthlyLetter      from '../monthly/MonthlyLetter'
import OverdueRescue      from '../tasks/OverdueRescue'
import DashboardNudges    from './DashboardNudges'
import CollapsibleWidget  from '../ui/CollapsibleWidget'
import { useAdaptiveDashboard } from '../../hooks/useAdaptiveDashboard'

export default function TodayView({
  tasks, habits, notes, mood, intention, gratitude,
  water, score, monthlyLetter, energy, affirmations, onTabChange,
}) {
  const adaptive  = useAdaptiveDashboard({ tasks, habits, mood, energy, xp: { getLevelInfo: () => null } })
  const scoreData = score.calculate()
  const isEvening = ['evening', 'night'].includes(adaptive.context)

  return (
    <div className="max-w-2xl mx-auto space-y-3 pt-2">

      {/* Week strip — always at top, swipeable */}
      <WeekStrip />

      {/* Monthly letter */}
      <MonthlyLetter monthlyLetter={monthlyLetter} />

      {/* Smart nudges */}
      <DashboardNudges nudges={adaptive.nudges} onTabChange={onTabChange} />

      {/* Overdue rescue */}
      <OverdueRescue tasks={tasks} />

      {/* Greeting + intention */}
      <GoodMorningHeader intention={intention} />

      {/* MORNING layout — plan first */}
      {!isEvening && (
        <>
          <CollapsibleWidget id="affirmations" emoji="✨" title="Affirmations" defaultOpen={false}>
            <AffirmationsCard affirmations={affirmations} />
          </CollapsibleWidget>

          <CollapsibleWidget id="mood" emoji="😊" title="Today's Mood" defaultOpen={true}>
            <MoodTracker mood={mood} />
          </CollapsibleWidget>

          <ProgressRing tasks={tasks} habits={habits} />

          <CollapsibleWidget id="tasks-today" emoji="✅" title="Today's Tasks" defaultOpen={true}>
            <TodayTaskList tasks={tasks} />
          </CollapsibleWidget>

          <CollapsibleWidget id="habits-today" emoji="🔁" title="Habits Today" defaultOpen={true}>
            <TodayHabitStrip habits={habits} />
          </CollapsibleWidget>

          <CollapsibleWidget id="energy" emoji="⚡" title="Energy" defaultOpen={false}>
            <EnergyCheckIn energy={energy} />
          </CollapsibleWidget>

          <CollapsibleWidget id="water" emoji="💧" title="Hydration" defaultOpen={true}>
            <WaterTracker water={water} />
          </CollapsibleWidget>

          <CollapsibleWidget id="focus-task" emoji="🎯" title="Focus Task" defaultOpen={false}>
            <FocusTask tasks={tasks} />
          </CollapsibleWidget>

          <CollapsibleWidget id="gratitude" emoji="🙏" title="Gratitude" defaultOpen={false}>
            <GratitudeLog gratitude={gratitude} />
          </CollapsibleWidget>

          <CollapsibleWidget id="quick-note" emoji="📝" title="Quick Note" defaultOpen={false}>
            <TodayQuickNote notes={notes} />
          </CollapsibleWidget>

          <DailyScore scoreData={scoreData} />
          <EndOfDayReview tasks={tasks} />
        </>
      )}

      {/* EVENING layout — review first */}
      {isEvening && (
        <>
          <CollapsibleWidget id="mood-eve" emoji="😊" title="Today's Mood" defaultOpen={true}>
            <MoodTracker mood={mood} />
          </CollapsibleWidget>

          <ProgressRing tasks={tasks} habits={habits} />

          <CollapsibleWidget id="habits-eve" emoji="🔁" title="Habits Today" defaultOpen={true}>
            <TodayHabitStrip habits={habits} />
          </CollapsibleWidget>

          <CollapsibleWidget id="tasks-eve" emoji="✅" title="Today's Tasks" defaultOpen={true}>
            <TodayTaskList tasks={tasks} />
          </CollapsibleWidget>

          <CollapsibleWidget id="gratitude-eve" emoji="🙏" title="Gratitude" defaultOpen={true}>
            <GratitudeLog gratitude={gratitude} />
          </CollapsibleWidget>

          <CollapsibleWidget id="water-eve" emoji="💧" title="Hydration" defaultOpen={false}>
            <WaterTracker water={water} />
          </CollapsibleWidget>

          <DailyScore scoreData={scoreData} />
          <EndOfDayReview tasks={tasks} />

          <CollapsibleWidget id="energy-eve" emoji="⚡" title="Energy" defaultOpen={false}>
            <EnergyCheckIn energy={energy} />
          </CollapsibleWidget>

          <CollapsibleWidget id="affirmations-eve" emoji="✨" title="Affirmations" defaultOpen={false}>
            <AffirmationsCard affirmations={affirmations} />
          </CollapsibleWidget>

          <CollapsibleWidget id="quick-note-eve" emoji="📝" title="Quick Note" defaultOpen={false}>
            <TodayQuickNote notes={notes} />
          </CollapsibleWidget>
        </>
      )}
    </div>
  )
}
