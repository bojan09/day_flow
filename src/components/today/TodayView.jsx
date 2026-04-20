// Component: TodayView
// Purpose: Adaptive daily command center — widget order shifts by time of day.
//          Smart nudges surface the most relevant action based on behaviour.
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
import { useAdaptiveDashboard } from '../../hooks/useAdaptiveDashboard'

export default function TodayView({
  tasks, habits, notes, mood, intention, gratitude,
  water, score, monthlyLetter, energy, affirmations, onTabChange,
}) {
  const adaptive  = useAdaptiveDashboard({ tasks, habits, mood, energy, xp: { getLevelInfo: () => null } })
  const scoreData = score.calculate()
  const isEvening = ['evening', 'night'].includes(adaptive.context)

  return (
    <div className="max-w-3xl mx-auto space-y-4 pt-2">

      {/* Week strip always at top */}
      <WeekStrip />

      {/* Monthly letter — only shows if one exists */}
      <MonthlyLetter monthlyLetter={monthlyLetter} />

      {/* Smart nudges — context-aware alerts */}
      <DashboardNudges nudges={adaptive.nudges} onTabChange={onTabChange} />

      {/* Overdue rescue — high priority */}
      <OverdueRescue tasks={tasks} />

      {/* Time-aware greeting */}
      <GoodMorningHeader intention={intention} />

      {/* MORNING / EARLY: plan-first layout */}
      {!isEvening && (
        <>
          <AffirmationsCard affirmations={affirmations} />
          <EnergyCheckIn energy={energy} />
          <MoodTracker mood={mood} />
          <FocusTask tasks={tasks} />
          <ProgressRing tasks={tasks} habits={habits} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TodayTaskList tasks={tasks} />
            <div className="flex flex-col gap-4">
              <TodayHabitStrip habits={habits} />
              <TodayQuickNote notes={notes} />
            </div>
          </div>
          <WaterTracker water={water} />
          <GratitudeLog gratitude={gratitude} />
          <DailyScore scoreData={scoreData} />
          <EndOfDayReview tasks={tasks} />
        </>
      )}

      {/* EVENING / NIGHT: review-first layout */}
      {isEvening && (
        <>
          <MoodTracker mood={mood} />
          <ProgressRing tasks={tasks} habits={habits} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TodayHabitStrip habits={habits} />
            <TodayTaskList tasks={tasks} />
          </div>
          <GratitudeLog gratitude={gratitude} />
          <WaterTracker water={water} />
          <DailyScore scoreData={scoreData} />
          <EndOfDayReview tasks={tasks} />
          <EnergyCheckIn energy={energy} />
          <AffirmationsCard affirmations={affirmations} />
          <TodayQuickNote notes={notes} />
        </>
      )}
    </div>
  )
}
