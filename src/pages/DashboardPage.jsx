// Page: DashboardPage
// Purpose: Root app page — owns all state hooks, renders active tab.
//          Hosts QuickCapture + KeyboardShortcuts as global overlays.
import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
import DashboardLayout    from '../layouts/DashboardLayout'
import TabSkeleton        from '../components/ui/TabSkeleton'
import ViewErrorBoundary  from '../components/ui/ViewErrorBoundary'
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
import { useAuth }             from '../hooks/useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'
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
import { useOnboarding     } from '../hooks/useOnboarding'
import { useTimeblocks    } from '../hooks/useTimeblocks'
import { usePersistedState } from '../hooks/usePersistedState'
import OnboardingFlow       from '../components/onboarding/OnboardingFlow'
import FeatureTooltip       from '../components/ui/FeatureTooltip'
import { spawnRecurringTasks }    from '../services/recurringEngine'
import { spawnRecurringWorkouts } from '../services/recurringWorkoutsEngine'
import { getTodayKey }            from '../utils/dateUtils'

// ── Weekly Review overlay helpers ───────────────────────────────────────────
const isSundayToday = () => new Date().getDay() === 0
const weeklyReviewDismissKey = () => `df_wr_dismissed_${getTodayKey()}`

export default function DashboardPage() {
  // Tab state persisted in URL hash so refresh preserves current tab
  const [activeTab, setActiveTabRaw] = useState(() => {
    const hash = window.location.hash.slice(1)
    const valid = ['today','tasks','habits','focus','calendar','timeblock','projects',
      'notes','ideas','braindump','bookmarks','workouts','routines','challenges',
      'goals','insights','balance','search','achievements','weeklyreview']
    return valid.includes(hash) ? hash : 'today'
  })

  const setActiveTab = useCallback((tab) => {
    setActiveTabRaw(tab)
    window.history.replaceState(null, '', `#${tab}`)
  }, [])

  const [showQuickCapture, setShowQuickCapture] = useState(false)

  // Weekly Review overlay — only auto-shows on Sundays, once per day
  const [showWeeklyOverlay, setShowWeeklyOverlay] = useState(() => {
    try {
      return isSundayToday() && !localStorage.getItem(weeklyReviewDismissKey())
    } catch {
      return false
    }
  })

  const handleDismissWeeklyOverlay = () => {
    setShowWeeklyOverlay(false)
    try { localStorage.setItem(weeklyReviewDismissKey(), '1') } catch { /* ignore */ }
  }

  const handleTabChange = setActiveTab   // alias used throughout

  // Handle PWA app shortcuts and share target via URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const action = params.get('action')
    const shareUrl   = params.get('url')
    const shareTitle = params.get('title')
    const shareText  = params.get('text')

    if (action === 'add-task')  { setActiveTab('tasks');   setShowQuickCapture(true) }
    if (action === 'log-mood')  { setActiveTab('today') }
    if (action === 'focus')     { setActiveTab('focus') }
    if (action === 'habits')    { setActiveTab('habits') }

    // Share target — auto-create bookmark from shared URL
    if (shareUrl || shareTitle) {
      const title = shareTitle || shareText || shareUrl || 'Shared link'
      const url   = shareUrl   || ''
      if (url || title) {
        bookmarks.addBookmark({ title: title.slice(0, 80), url, tags: ['shared'] })
        setActiveTab('bookmarks')
        // Clean URL params
        window.history.replaceState({}, '', '/')
      }
    }
  }, [])

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
  const { user }             = useAuth()
  const moodTheme  = useMoodTheme(mood, theme)
  const onboarding  = useOnboarding()
  const timeblocks  = useTimeblocks()
  const score = useDailyScore({ tasks, habits, mood, gratitude, water })

  // Recurring engine — synchronous localStorage guard (never async).
  // Key = userId + today's date → unique per user, auto-expires at midnight.
  // Waits for: auth resolved + both data sources synced.
  // If Supabase not configured (demo mode), userId = 'demo' is intentional.
  useEffect(() => {
    const isConfigured = isSupabaseConfigured()
    // Wait for auth to resolve when Supabase is configured
    if (isConfigured && !user) return
    if (!tasks.synced || !workouts.synced) return

    const today   = new Date().toISOString().split('T')[0]
    const uid     = user?.id || 'demo'
    const flagKey = `df_spawned_${uid}_${today}`
    try {
      if (localStorage.getItem(flagKey)) return
      localStorage.setItem(flagKey, '1')
    } catch { return }
    spawnRecurringTasks(tasks.tasks, tasks.addTask)
    spawnRecurringWorkouts(workouts.sessions, workouts.addSession)
  }, [user, tasks.synced, workouts.synced])

  const handleWriteNote = useCallback((prompt) => {
    notes.addNote({ title: 'Reflection', content: `Prompt: ${prompt}\n\n`, tags: ['reflection'] })
    setActiveTab('notes')
  }, [notes.addNote, setActiveTab])

  return (
    <>
      <KeyboardShortcuts onTabChange={handleTabChange} />

      {/* First-run onboarding wizard — shown once */}
      {onboarding.shouldShow && (
        <OnboardingFlow
          onboarding={onboarding}
          tasks={tasks}
          habits={habits}
          goals={goals}
          onSetTheme={setTheme}
        />
      )}

      <Suspense fallback={<TabSkeleton />}>
      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange} theme={theme} onSetTheme={setTheme}>
      <ViewErrorBoundary key={activeTab}>

        {/* ── Plan ─────────────────────────────────────────────────────────── */}
        {activeTab === 'today'      && <TodayView tasks={tasks} habits={habits} notes={notes} mood={mood} intention={intention} gratitude={gratitude} water={water} score={score} monthlyLetter={monthlyLetter} energy={energy} affirmations={affirmations} onTabChange={handleTabChange} xp={xp} goals={goals} projects={projects} workouts={workouts} challenges={challenges} ideas={ideas} timeblocks={timeblocks} />}
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
        {activeTab === 'insights'   && <InsightsView mood={mood} habits={habits} tasks={tasks} notes={notes} theme={theme} onSetTheme={setTheme} onWriteNote={handleWriteNote} intentions={intention} xp={xp} achievements={achievements} energy={energy} goals={goals} water={water} moodTheme={moodTheme} workouts={workouts} ideas={ideas} bookmarks={bookmarks} />}
        {activeTab === 'balance'    && <BalanceView wheel={wheel} />}
        {activeTab === 'focus'      && <FocusMode tasks={tasks} xp={xp} pomodoroHistory={pomodoroHistory} />}
        {activeTab === 'achievements' && <AchievementsView achievements={achievements} xp={xp} />}
        {activeTab === 'search'     && <SearchView tasks={tasks} notes={notes} habits={habits} goals={goals} ideas={ideas} bookmarks={bookmarks} />}

      </ViewErrorBoundary>
      </DashboardLayout>
      </Suspense>

      <QuickCapture tasks={tasks} ideas={ideas} notes={notes} habits={habits} onTabChange={handleTabChange} />

      {/* Weekly Review overlay — Sunday only, once per day, lazy-loaded safely */}
      {showWeeklyOverlay && (
        <Suspense fallback={null}>
          <WeeklyReview
            tasks={tasks}
            habits={habits}
            mood={mood}
            notes={notes}
            onClose={handleDismissWeeklyOverlay}
          />
        </Suspense>
      )}
    </>
  )
}
