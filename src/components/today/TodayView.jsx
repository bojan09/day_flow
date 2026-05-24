// Component: TodayView
// Purpose: Adaptive daily command center.
//          Version 4.2: dynamic ordering, widget pinning, hide support.
//          Widget order is driven by time-of-day + user preferences.
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
import QuickPlannerWidget from './QuickPlannerWidget'
import DailySummaryCard       from '../summary/DailySummaryCard'
import SmartMorningBrief     from './SmartMorningBrief'
import PriorityRecommendation from './PriorityRecommendation'
import { useSmartScheduler }  from '../../hooks/useSmartScheduler'
import FeatureTooltip        from '../ui/FeatureTooltip'
import ProjectsWidget    from './modules/ProjectsWidget'
import GoalsWidget       from './modules/GoalsWidget'
import WorkoutsWidget    from './modules/WorkoutsWidget'
import ChallengesWidget  from './modules/ChallengesWidget'
import CalendarWidget    from './modules/CalendarWidget'
import NotesWidget       from './modules/NotesWidget'
import IdeasWidget       from './modules/IdeasWidget'
import MiniHabitWidget    from '../habits/MiniHabitWidget'
import WidgetCustomizer   from './WidgetCustomizer'
import { useAdaptiveDashboard }  from '../../hooks/useAdaptiveDashboard'
import { useWidgetPreferences, WIDGET_REGISTRY } from '../../hooks/useWidgetPreferences'
import { useState } from 'react'

// Adaptive default orders by time context
const MORNING_ORDER   = ['mood','tasks-today','habits-today','energy','water','focus-task','gratitude','affirmations','quick-note']
const AFTERNOON_ORDER = ['focus-task','tasks-today','habits-today','mood','water','energy','gratitude','quick-note','affirmations']
const EVENING_ORDER   = ['mood','habits-today','tasks-today','gratitude','water','energy','focus-task','affirmations','quick-note']

// Map widget id → the component to render
function WidgetContent({ id, tasks, habits, notes, mood, energy, gratitude, water, affirmations,
  goals, projects, workouts, challenges, ideas, timeblocks, onTabChange }) {
  switch (id) {
    case 'mood':               return <MoodTracker mood={mood} />
    case 'tasks-today':        return <TodayTaskList tasks={tasks} />
    case 'habits-today':       return <TodayHabitStrip habits={habits} />
    case 'water':              return <WaterTracker water={water} />
    case 'energy':             return <EnergyCheckIn energy={energy} />
    case 'gratitude':          return <GratitudeLog gratitude={gratitude} />
    case 'focus-task':         return <FocusTask tasks={tasks} />
    case 'affirmations':       return <AffirmationsCard affirmations={affirmations} />
    case 'quick-note':         return <TodayQuickNote notes={notes} />
    case 'mini-habits':        return <MiniHabitWidget habits={habits} />
    case 'module-projects':    return <ProjectsWidget   projects={projects}   tasks={tasks}      onTabChange={onTabChange} />
    case 'module-goals':       return <GoalsWidget      goals={goals}                            onTabChange={onTabChange} />
    case 'module-workouts':    return <WorkoutsWidget   workouts={workouts}                      onTabChange={onTabChange} />
    case 'module-challenges':  return <ChallengesWidget challenges={challenges}                  onTabChange={onTabChange} />
    case 'module-calendar':    return <CalendarWidget   timeblocks={timeblocks}                  onTabChange={onTabChange} />
    case 'module-notes':       return <NotesWidget      notes={notes}                            onTabChange={onTabChange} />
    case 'module-ideas':       return <IdeasWidget      ideas={ideas}                            onTabChange={onTabChange} />
    default:                   return null
  }
}

export default function TodayView({
  tasks, habits, notes, mood, intention, gratitude,
  water, score, monthlyLetter, energy, affirmations, onTabChange, xp,
  goals, projects, workouts, challenges, ideas, timeblocks,
}) {
  const adaptive   = useAdaptiveDashboard({ tasks, habits, mood, energy, xp: { getLevelInfo: () => null } })
  const { analysis } = useSmartScheduler({ tasks, energy, habits })
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

  const widgetProps = { tasks, habits, notes, mood, energy, gratitude, water, affirmations, goals, projects, workouts, challenges, ideas, timeblocks, onTabChange }

  return (
    <div className="max-w-2xl mx-auto space-y-3 pt-2">

      {/* Week strip */}
      <WeekStrip />

      {/* Monthly letter */}
      <MonthlyLetter monthlyLetter={monthlyLetter} />

      {/* Smart nudges */}
      <DashboardNudges nudges={adaptive.nudges} onTabChange={onTabChange} />

      {/* Priority recommendation */}
      <PriorityRecommendation analysis={analysis} onTabChange={onTabChange} />

      {/* Overdue rescue */}
      <OverdueRescue tasks={tasks} />

      {/* Greeting */}
      <GoodMorningHeader intention={intention} />

      {/* AI morning brief — shown only before noon, auto-generated */}
      {!isEvening && !isAfternoon && (
        <SmartMorningBrief tasks={tasks} habits={habits} mood={mood} goals={goals} />
      )}

      {/* Customize button */}
      <div className="flex justify-end px-1">
        <FeatureTooltip id="widget-customize">
          <button
            onClick={() => setShowCustomizer(true)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
          >
            ✦ Customize
          </button>
        </FeatureTooltip>
      </div>

      {/* Dynamic widget list */}
      {orderedIds.map(id => {
        const meta    = getMeta(id)
        const content = <WidgetContent id={id} {...widgetProps} />
        if (!content) return null

        return (
          <CollapsibleWidget
            key={id}
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
        )
      })}

      {/* Evening: daily summary recap */}
      {isEvening && (
        <CollapsibleWidget id="daily-summary" emoji="📊" title="Today's Summary" defaultOpen={true}>
          <DailySummaryCard tasks={tasks} habits={habits} mood={mood} water={water} xp={xp} />
        </CollapsibleWidget>
      )}

      {/* Evening: plan tomorrow */}
      {isEvening && (
        <CollapsibleWidget id="planner-tomorrow" emoji="📅" title="Plan Tomorrow" defaultOpen={true}>
          <QuickPlannerWidget tasks={tasks} />
        </CollapsibleWidget>
      )}

      {/* Static bottom widgets — always shown, never rearranged */}
      <ProgressRing tasks={tasks} habits={habits} />
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
