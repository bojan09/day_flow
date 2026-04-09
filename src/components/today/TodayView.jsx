// Component: TodayView
// Purpose: Full daily command center — every widget assembled in logical order
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

export default function TodayView({ tasks, habits, notes, mood, intention, gratitude, water, score, monthlyLetter, energy, affirmations }) {
  const scoreData = score.calculate()
  return (
    <div className="max-w-3xl mx-auto space-y-4 pt-2">
      <WeekStrip />
      <MonthlyLetter monthlyLetter={monthlyLetter} />
      <OverdueRescue tasks={tasks} />
      <GoodMorningHeader intention={intention} />
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
    </div>
  )
}
