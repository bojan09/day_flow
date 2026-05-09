// Page: DashboardPage
// Purpose: Root app page — owns all state hooks, renders active tab.
//          Hosts QuickCapture + KeyboardShortcuts as global overlays.
import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import DashboardLayout    from '../layouts/DashboardLayout'
import TabSkeleton        from '../components/ui/TabSkeleton'
import TodayView          from '../components/today/TodayView'
import TasksView          from '../components/tasks/TasksView'
const NotesView = lazy(() => import('../components/notes/NotesView'))
import HabitsView         from '../components/habits/HabitsView'
const GoalsView = lazy(() => import('../components/goals/GoalsView'))
import FocusMode          from '../components/focus/FocusMode'
const SearchView = lazy(() => import('../components/search/SearchView'))
const InsightsView = lazy(() => import('../components/insights/InsightsView'))
const BalanceView = lazy(() => import('../components/balance/BalanceView'))
const WorkoutsView = lazy(() => import('../components/workouts/WorkoutsView'))
const AchievementsView = lazy(() => import('../components/insights/AchievementsView'))
const TimeBlockView = lazy(() => import('../components/timeblock/TimeBlockView'))
const CalendarView = lazy(() => import('../components/calendar/CalendarView'))
const IdeasView = lazy(() => import('../components/ideas/IdeasView'))
const BrainDump = lazy(() => import('../components/braindump/BrainDump'))
const RoutinesView = lazy(() => import('../components/routines/RoutinesView'))
const ChallengesView = lazy(() => import('../components/challenges/ChallengesView'))
const ProjectsView = lazy(() => import('../components/projects/ProjectsView'))
const BookmarksView = lazy(() => import('../components/bookmarks/BookmarksView'))
const WeeklyReview = lazy(() => import('../components/weekly/WeeklyReview'))
import KeyboardShortcuts  from '../components/keyboard/KeyboardShortcuts'
import QuickCapture       from '../components/quickcapture/QuickCapture'

import { useTasks           } from '../hooks/useTasks'
import { useNotes           } from '../hooks/useNotes'
import { useHabits          } from '../hooks/useHabits'
import { useMood            } from '../hooks/useMood'
import { useTheme           } from '../hooks/useTheme'
import { useIntention       } from '../hooks/useIntention'
import { useGoals           } from '../hooks/useGoals'
import { useXP              } from '../hooks/useXP'
import { useSomeday         } from '../hooks/useSomeday'
import { useGratitude       } from '../hooks/useGratitude'
import { useTemplates       } from '../hooks/useTemplates'
import { useEnergy          } from '../hooks/useEnergy'
import { useWater           } from '../hooks/useWater'
import { useDailyScore      } from '../hooks/useDailyScore'
import { useMonthlyLetter   } from '../hooks/useMonthlyLetter'
import { usePomodoroHistory } from '../hooks/usePomodoroHistory'
import { useHabitRules      } from '../hooks/useHabitRules'
import { useIdeas           } from '../hooks/useIdeas'
import { useRoutines        } from '../hooks/useRoutines'
import { useChallenges      } from '../hooks/useChallenges'
import { useBalanceWheel    } from '../hooks/useBalanceWheel'
import { useProjects        } from '../hooks/useProjects'
import { useBookmarks       } from '../hooks/useBookmarks'
import { useAffirmations    } from '../hooks/useAffirmations'
import { useWorkouts        } from '../hooks/useWorkouts'
import { useCustomCategories } from '../hooks/useCustomCategories'
import { useAchievements    } from '../hooks/useAchievements'
import { useMoodTheme       } from '../hooks/useMoodTheme'
import VoiceCommandBar     from '../components/voice/VoiceCommandBar'
import { spawnRecurringTasks }    from '../services/recurringEngine'
import { spawnRecurringWorkouts } from '../services/recurringWorkoutsEngine'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('today')
  const handleTabChange = setActiveTab   // alias used throughout

  // ── Data hooks ──────────────────────────────────────────────────────────────
  const tasks           = useTasks()
  const notes           = useNotes()
  const habits          = useHabits()
  const mood            = useMood()
  const intention       = useIntention()
  const gratitude       = useGratitude()
  const goals           = useGoals()
  const xp              = useXP()
  const someday         = useSomeday()
  const templates       = useTemplates()
  const energy          = useEnergy()
  const water           = useWater()
  const monthlyLetter   = useMonthlyLetter()
  const pomodoroHistory = usePomodoroHistory()
  const habitRules      = useHabitRules()
  const ideas           = useIdeas()
  const routines        = useRoutines()
  const challenges      = useChallenges()
  const wheel           = useBalanceWheel()
  const projects        = useProjects()
  const bookmarks       = useBookmarks()
  const affirmations    = useAffirmations()
  const workouts        = useWorkouts()
  const catData         = useCustomCategories()
  const achievements    = useAchievements({ tasks, habits, notes, goals, xp, workouts, mood })
  const { theme, setTheme } = useTheme()
  const moodTheme = useMoodTheme(mood, theme)
  const score = useDailyScore({ tasks, habits, mood, gratitude, water })

  // Recurring engine — runs once after data loads, ref prevents double-fire
  const spawnedRef = useRef(false)
  useEffect(() => {
    // Wait until tasks are actually loaded (non-empty or synced)
    if (spawnedRef.current) return
    if (tasks.tasks === undefined) return
    spawnedRef.current = true
    spawnRecurringTasks(tasks.tasks, tasks.addTask)
    spawnRecurringWorkouts(workouts.sessions, workouts.addSession)
  }, [tasks.tasks.length, workouts.sessions.length])

  const handleWriteNote = (prompt) => {
    notes.addNote({ title: 'Reflection', content: `Prompt: ${prompt}\n\n`, tags: ['reflection'] })
    setActiveTab('notes')
  }

  return (
    <>
      <KeyboardShortcuts onTabChange={handleTabChange} />

      <Suspense fallback={<TabSkeleton />}>
      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange} theme={theme} onSetTheme={setTheme}>

        {/* ── Plan ─────────────────────────────────────────────────────────── */}
        {activeTab === 'today'      && <TodayView tasks={tasks} habits={habits} notes={notes} mood={mood} intention={intention} gratitude={gratitude} water={water} score={score} monthlyLetter={monthlyLetter} energy={energy} affirmations={affirmations} onTabChange={handleTabChange} xp={xp} goals={goals} />}
        {activeTab === 'tasks'      && <TasksView tasks={tasks} templates={templates} someday={someday} projects={projects.projects} categories={catData.all} onAddCategory={catData.addCategory} onRemoveCategory={catData.removeCategory} onTabChange={handleTabChange} energy={energy} habits={habits} ideas={ideas} />}
        {activeTab === 'calendar'   && <CalendarView tasks={tasks} categories={catData.all} onAddCategory={catData.addCategory} onRemoveCategory={catData.removeCategory} />}
        {activeTab === 'timeblock'  && <TimeBlockView tasks={tasks} />}
        {activeTab === 'projects'   && <ProjectsView projects={projects} tasks={tasks} />}

        {/* ── Build ────────────────────────────────────────────────────────── */}
        {activeTab === 'habits'     && <HabitsView habits={habits} habitRules={habitRules} />}
        {activeTab === 'routines'   && <RoutinesView routines={routines} />}
        {activeTab === 'challenges' && <ChallengesView challenges={challenges} />}
        {activeTab === 'goals'      && <GoalsView goals={goals} xp={xp} />}
        {activeTab === 'workouts'   && <WorkoutsView workouts={workouts} />}

        {/* ── Think ────────────────────────────────────────────────────────── */}
        {activeTab === 'notes'      && <NotesView notes={notes} />}
        {activeTab === 'ideas'      && <IdeasView ideas={ideas} goals={goals} categories={catData.all} onAddCategory={catData.addCategory} onRemoveCategory={catData.removeCategory} />}
        {activeTab === 'braindump'  && <BrainDump tasks={tasks} ideas={ideas} notes={notes} />}
        {activeTab === 'bookmarks'  && <BookmarksView bookmarks={bookmarks} />}

        {/* ── Reflect ──────────────────────────────────────────────────────── */}
        {activeTab === 'insights'   && <InsightsView mood={mood} habits={habits} tasks={tasks} notes={notes} theme={theme} onSetTheme={setTheme} onWriteNote={handleWriteNote} intentions={intention} xp={xp} achievements={achievements} energy={energy} goals={goals} water={water} moodTheme={moodTheme} />}
        {activeTab === 'balance'    && <BalanceView wheel={wheel} />}
        {activeTab === 'focus'      && <FocusMode tasks={tasks} xp={xp} pomodoroHistory={pomodoroHistory} />}
        {activeTab === 'achievements' && <AchievementsView achievements={achievements} xp={xp} />}
        {activeTab === 'search'     && <SearchView tasks={tasks} notes={notes} habits={habits} goals={goals} ideas={ideas} bookmarks={bookmarks} />}

      </DashboardLayout>
      </Suspense>

      <QuickCapture tasks={tasks} ideas={ideas} notes={notes} habits={habits} onTabChange={handleTabChange} />
      <VoiceCommandBar tasks={tasks} habits={habits} notes={notes} ideas={ideas} />
      <WeeklyReview tasks={tasks} habits={habits} mood={mood} />
    </>
  )
}
