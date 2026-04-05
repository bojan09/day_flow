// Component: TodayView
// Purpose: Main "Today" dashboard — overview of tasks, habits, and quick note
import TodaySummaryBar  from './TodaySummaryBar'
import TodayTaskList    from './TodayTaskList'
import TodayHabitStrip  from './TodayHabitStrip'
import TodayQuickNote   from './TodayQuickNote'
import WeekStrip        from './WeekStrip'

export default function TodayView({ tasks, habits, notes }) {
  return (
    <div className="max-w-3xl mx-auto space-y-5 pt-2">
      <WeekStrip />
      <TodaySummaryBar tasks={tasks} habits={habits} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TodayTaskList tasks={tasks} />
        <div className="flex flex-col gap-5">
          <TodayHabitStrip habits={habits} />
          <TodayQuickNote notes={notes} />
        </div>
      </div>
    </div>
  )
}
