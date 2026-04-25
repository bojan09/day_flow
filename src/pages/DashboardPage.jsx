// Page: DashboardPage
// Purpose: Root app page — owns all state hooks, renders active tab.
//          Hosts QuickCapture + KeyboardShortcuts as global overlays.
import { useState, useEffect } from 'react'
import DashboardLayout    from '../layouts/DashboardLayout'
import TodayView          from '../components/today/TodayView'
import TasksView          from '../components/tasks/TasksView'
import NotesView          from '../components/notes/NotesView'
import HabitsView         from '../components/habits/HabitsView'
import GoalsView          from '../components/goals/GoalsView'
import FocusMode          from '../components/focus/FocusMode'
import SearchView         from '../components/search/SearchView'
import InsightsView       from '../components/insights/InsightsView'
import BalanceView        from '../components/balance/BalanceView'
import WorkoutsView       from '../components/workouts/WorkoutsView'
import AchievementsView   from '../components/insights/AchievementsView'
import TimeBlockView      from '../components/timeblock/TimeBlockView'
import CalendarView       from '../components/calendar/CalendarView'
import IdeasView          from '../components/ideas/IdeasView'
import BrainDump          from '../components/braindump/BrainDump'
import RoutinesView       from '../components/routines/RoutinesView'
import ChallengesView     from '../components/challenges/ChallengesView'
import ProjectsView       from '../components/projects/ProjectsView'
import BookmarksView      from '../components/bookmarks/BookmarksView'
import WeeklyReview       from '../components/weekly/WeeklyReview'
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
import { spawnRecurringTasks } from '../services/recurringEngine'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('today')

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
  const score = useDailyScore({ tasks, habits, mood, gratitude, water })

  useEffect(() => { spawnRecurringTasks(tasks.tasks, tasks.addTask) }, [])

  const handleWriteNote = (prompt) => {
    notes.addNote({ title: 'Reflection', content: `Prompt: ${prompt}\n\n`, tags: ['reflection'] })
    setActiveTab('notes')
  }

  return (
    <>
      <KeyboardShortcuts onTabChange={setActiveTab} />

      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} theme={theme} onSetTheme={setTheme}>

        {/* ── Plan ─────────────────────────────────────────────────────────── */}
        {activeTab === 'today'      && <TodayView tasks={tasks} habits={habits} notes={notes} mood={mood} intention={intention} gratitude={gratitude} water={water} score={score} monthlyLetter={monthlyLetter} energy={energy} affirmations={affirmations} onTabChange={setActiveTab} xp={xp} />}
        {activeTab === 'tasks'      && <TasksView tasks={tasks} templates={templates} someday={someday} projects={projects.projects} categories={catData.all} onAddCategory={catData.addCategory} onRemoveCategory={catData.removeCategory} onTabChange={setActiveTab} energy={energy} habits={habits} />}
        {activeTab === 'calendar'   && <CalendarView tasks={tasks} />}
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
        {activeTab === 'ideas'      && <IdeasView ideas={ideas} goals={goals} />}
        {activeTab === 'braindump'  && <BrainDump tasks={tasks} ideas={ideas} notes={notes} />}
        {activeTab === 'bookmarks'  && <BookmarksView bookmarks={bookmarks} />}

        {/* ── Reflect ──────────────────────────────────────────────────────── */}
        {activeTab === 'insights'   && <InsightsView mood={mood} habits={habits} tasks={tasks} notes={notes} theme={theme} onSetTheme={setTheme} onWriteNote={handleWriteNote} intentions={intention} xp={xp} achievements={achievements} energy={energy} goals={goals} water={water} />}
        {activeTab === 'balance'    && <BalanceView wheel={wheel} />}
        {activeTab === 'focus'      && <FocusMode tasks={tasks} xp={xp} pomodoroHistory={pomodoroHistory} />}
        {activeTab === 'achievements' && <AchievementsView achievements={achievements} xp={xp} />}
        {activeTab === 'search'     && <SearchView tasks={tasks} notes={notes} habits={habits} goals={goals} ideas={ideas} bookmarks={bookmarks} />}

      </DashboardLayout>

      <QuickCapture tasks={tasks} ideas={ideas} notes={notes} habits={habits} onTabChange={setActiveTab} />
      <WeeklyReview tasks={tasks} habits={habits} mood={mood} />
    </>
  )
}
