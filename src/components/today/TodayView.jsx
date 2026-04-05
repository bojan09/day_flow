// Component: TodayView
// Purpose: Main "Today" dashboard — mood check-in, stats, tasks, habits, quick note
import TodaySummaryBar  from './TodaySummaryBar'
import TodayTaskList    from './TodayTaskList'
import TodayHabitStrip  from './TodayHabitStrip'
import TodayQuickNote   from './TodayQuickNote'
import WeekStrip        from './WeekStrip'
import MoodTracker      from '../insights/MoodTracker'

export default function TodayView({ tasks, habits, notes, mood }) {
  return (
    <div className="max-w-3xl mx-auto space-y-4 pt-2">
      <WeekStrip />
      <MoodTracker mood={mood} />
      <TodaySummaryBar tasks={tasks} habits={habits} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TodayTaskList tasks={tasks} />
        <div className="flex flex-col gap-4">
          <TodayHabitStrip habits={habits} />
          <TodayQuickNote notes={notes} />
        </div>
      </div>
    </div>
  )
}
