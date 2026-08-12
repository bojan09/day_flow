// Component: TodayView
// Purpose: Adaptive daily command center.
//          Version 4.2: dynamic ordering, widget pinning, hide support.
//          Widget order is driven by time-of-day + user preferences.
import GoodMorningHeader  from './GoodMorningHeader'
import EnergyCheckIn      from './EnergyCheckIn'
import FocusTask          from './FocusTask'
import ProgressRing       from './ProgressRing'
import TodayTaskList      from './TodayTaskList'
import TodayHabitStrip    from './TodayHabitStrip'
import TodayQuickNote     from './TodayQuickNote'
import WeekStrip          from './WeekStrip'
import MoodTracker        from '../insights/MoodTracker'
import EndOfDayReview     from '../summary/EndOfDayReview'
import DailyScore         from '../score/DailyScore'
import OverdueRescue      from '../tasks/OverdueRescue'
import DashboardNudges    from './DashboardNudges'
import CollapsibleWidget  from '../ui/CollapsibleWidget'
import QuickPlannerWidget from './QuickPlannerWidget'
import DailySummaryCard       from '../summary/DailySummaryCard'
import SmartMorningBrief     from './SmartMorningBrief'
import PriorityRecommendation from './PriorityRecommendation'
import { useSmartScheduler }  from '../../hooks/useSmartScheduler'
import FeatureTooltip        from '../ui/FeatureTooltip'
import ProjectsWidget    from './modules/ProjectsWidget'
import GoalsWidget       from './modules/GoalsWidget'
import WorkoutsWidget    from './modules/WorkoutsWidget'
import CalendarWidget    from './modules/CalendarWidget'
import NotesWidget       from './modules/NotesWidget'
import IdeasWidget       from './modules/IdeasWidget'
import MiniHabitWidget    from '../habits/MiniHabitWidget'
import WidgetCustomizer   from './WidgetCustomizer'
import BentoGrid, { BentoCell } from './BentoGrid'
import { useAdaptiveDashboard }  from '../../hooks/useAdaptiveDashboard'
import { useWidgetPreferences, WIDGET_REGISTRY } from '../../hooks/useWidgetPreferences'
import { useState } from 'react'
import DailyPriorities from './DailyPriorities'

// Adaptive default orders by time context
const MORNING_ORDER   = ['mood','tasks-today','habits-today','energy','focus-task','quick-note']
const AFTERNOON_ORDER = ['focus-task','tasks-today','habits-today','mood','energy','quick-note']
const EVENING_ORDER   = ['mood','habits-today','tasks-today','energy','focus-task','quick-note']

// Map widget id → the component to render
function WidgetContent({ id, tasks, habits, notes, mood, energy,
  goals, projects, workouts, ideas, timeblocks, onTabChange }) {
  switch (id) {
    case 'mood':               return <MoodTracker mood={mood} />
    case 'tasks-today':        return <TodayTaskList tasks={tasks} />
    case 'habits-today':       return <TodayHabitStrip habits={habits} />
    case 'energy':             return <EnergyCheckIn energy={energy} />
    case 'focus-task':         return <FocusTask tasks={tasks} />
    case 'quick-note':         return <TodayQuickNote notes={notes} />
    case 'mini-habits':        return <MiniHabitWidget habits={habits} />
    case 'module-projects':    return <ProjectsWidget   projects={projects}   tasks={tasks}      onTabChange={onTabChange} />
    case 'module-goals':       return <GoalsWidget      goals={goals}                            onTabChange={onTabChange} />
    case 'module-workouts':    return <WorkoutsWidget   workouts={workouts}                      onTabChange={onTabChange} />
    case 'module-calendar':    return <CalendarWidget   timeblocks={timeblocks}                  onTabChange={onTabChange} />
    case 'module-notes':       return <NotesWidget      notes={notes}                            onTabChange={onTabChange} />
    case 'module-ideas':       return <IdeasWidget      ideas={ideas}                            onTabChange={onTabChange} />
    default:                   return null
  }
}

export default function TodayView({
  tasks, habits, notes, mood, intention,
  score, energy, onTabChange,
  goals, projects, workouts, ideas, timeblocks, routines,
  dailyPriorities, onStartFocus,
}) {
  const adaptive   = useAdaptiveDashboard({ tasks, habits, mood, energy })
  const { analysis } = useSmartScheduler({ tasks, energy, habits, dailyPriorityIds: dailyPriorities?.ids ?? [], projects })
  const widgetPrefs = useWidgetPreferences()
  // score now exposes todayScore directly — no re-calculation needed
  const scoreData = score.total !== undefined ? score : score.calculate?.()
  const [showCustomizer, setShowCustomizer] = useState(false)

  // Pick adaptive default order based on time context
  const isEvening = ['evening', 'night'].includes(adaptive.context)
  const isAfternoon = adaptive.context === 'afternoon'
  const adaptiveDefault = isEvening ? EVENING_ORDER : isAfternoon ? AFTERNOON_ORDER : MORNING_ORDER

  // Apply user preferences on top of adaptive order
  const orderedIds = widgetPrefs.getOrderedWidgets(adaptiveDefault)

  // Get registry entry for a widget
  const getMeta = (id) => WIDGET_REGISTRY.find(w => w.id === id) ?? { id, title: id, emoji: '📦', defaultOpen: false }

  const widgetProps = { tasks, habits, notes, mood, energy, goals, projects, workouts, ideas, timeblocks, onTabChange }

  return (
    <div className="max-w-2xl mx-auto space-y-3 pt-2">

      {/* Non-hideable action hierarchy */}
      <GoodMorningHeader intention={intention} />
      <PriorityRecommendation analysis={analysis} onTabChange={onTabChange} onStartFocus={onStartFocus} />
      <ProgressRing tasks={tasks} habits={habits} />
      <DashboardNudges nudges={adaptive.nudges} onTabChange={onTabChange} />
      <OverdueRescue tasks={tasks} habits={habits} routines={routines} onStartFocus={onStartFocus} onOpen={onTabChange} />

      {/* AI morning brief — shown only before noon, auto-generated */}
      {!isEvening && !isAfternoon && (
        <SmartMorningBrief tasks={tasks} habits={habits} mood={mood} goals={goals} />
      )}

      {dailyPriorities && <DailyPriorities priorities={dailyPriorities} allTasks={tasks.tasks} onToggleTask={tasks.toggleTask} onStartFocus={onStartFocus} />}
      <FocusTask tasks={tasks} />
      <TodayTaskList tasks={tasks} />
      <EnergyCheckIn energy={energy} />
      <MoodTracker mood={mood} />
      <TodayHabitStrip habits={habits} />
      <TodayQuickNote notes={notes} />

      <WeekStrip />

      {/* Customize button */}
      <div className="flex justify-end px-1">
        <FeatureTooltip id="widget-customize">
          <button
            onClick={() => setShowCustomizer(true)}
            className="hover-surface flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
          >
            ✦ Customize
          </button>
        </FeatureTooltip>
      </div>

      {/* Dynamic widget list — bento grid */}
      <BentoGrid>
        {orderedIds.map((id, idx) => {
          const meta    = getMeta(id)
          const content = <WidgetContent id={id} {...widgetProps} />
          if (!content) return null

          return (
            <BentoCell key={id} size={idx === 0 ? 'hero' : 'standard'}>
              <CollapsibleWidget
                id={id}
                title={meta.title}
                emoji={meta.emoji}
                defaultOpen={meta.defaultOpen}
                isPinned={widgetPrefs.isPinned(id)}
                onTogglePin={widgetPrefs.togglePin}
                onToggleHide={widgetPrefs.toggleHide}
              >
                {content}
              </CollapsibleWidget>
            </BentoCell>
          )
        })}
      </BentoGrid>

      {/* Evening: daily summary recap */}
      {isEvening && (
        <CollapsibleWidget id="daily-summary" emoji="📊" title="Today's Summary" defaultOpen={true}>
          <DailySummaryCard tasks={tasks} habits={habits} mood={mood} />
        </CollapsibleWidget>
      )}

      {/* Evening: plan tomorrow */}
      {isEvening && (
        <CollapsibleWidget id="planner-tomorrow" emoji="📅" title="Plan Tomorrow" defaultOpen={true}>
          <QuickPlannerWidget tasks={tasks} />
        </CollapsibleWidget>
      )}

      {/* Static bottom widgets — always shown, never rearranged */}
      <DailyScore scoreData={scoreData} />
      <EndOfDayReview tasks={tasks} />

      {/* Widget customizer panel */}
      <WidgetCustomizer
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        widgetPrefs={widgetPrefs}
        adaptiveOrder={adaptiveDefault}
      />
    </div>
  )
}
