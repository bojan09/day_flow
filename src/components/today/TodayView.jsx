// Component: TodayView
// Purpose: Today tab — full daily command center with all Phase 3-5 widgets
import GoodMorningHeader from './GoodMorningHeader'
import FocusTask         from './FocusTask'
import ProgressRing      from './ProgressRing'
import TodayTaskList     from './TodayTaskList'
import TodayHabitStrip   from './TodayHabitStrip'
import TodayQuickNote    from './TodayQuickNote'
import WeekStrip         from './WeekStrip'
import MoodTracker       from '../insights/MoodTracker'
import GratitudeLog      from '../gratitude/GratitudeLog'
import EndOfDayReview    from '../summary/EndOfDayReview'

export default function TodayView({ tasks, habits, notes, mood, intention, gratitude }) {
  return (
    <div className="max-w-3xl mx-auto space-y-4 pt-2">
      <WeekStrip />
      <GoodMorningHeader intention={intention} />
      <MoodTracker mood={mood} />
      <FocusTask tasks={tasks} />
      <ProgressRing tasks={tasks} habits={habits} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TodayTaskList tasks={tasks} />
        <div className="flex flex-col gap-4">
          <TodayHabitStrip habits={habits} />
          <TodayQuickNote  notes={notes} />
        </div>
      </div>
      <GratitudeLog gratitude={gratitude} />
      <EndOfDayReview tasks={tasks} />
    </div>
  )
}
