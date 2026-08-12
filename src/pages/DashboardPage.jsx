// Page: DashboardPage
// Purpose: Root app page — owns all state hooks, renders active tab.
//          Hosts QuickCapture + KeyboardShortcuts as global overlays.
import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardLayout    from '../layouts/DashboardLayout'
import TabSkeleton        from '../components/ui/TabSkeleton'
import ViewErrorBoundary  from '../components/ui/ViewErrorBoundary'
import TodayView          from '../components/today/TodayView'
import TasksView          from '../components/tasks/TasksView'
import HabitsView         from '../components/habits/HabitsView'
const GoalsView = lazy(() => import('../components/goals/GoalsView'))
import FocusMode          from '../components/focus/FocusMode'
const SearchView = lazy(() => import('../components/search/SearchView'))
const InsightsView = lazy(() => import('../components/insights/InsightsView'))
const WorkoutsView = lazy(() => import('../components/workouts/WorkoutsView'))
const TimeBlockView = lazy(() => import('../components/timeblock/TimeBlockView'))
const CalendarView = lazy(() => import('../components/calendar/CalendarView'))
const CaptureView = lazy(() => import('../components/capture/CaptureView'))
const RoutinesView = lazy(() => import('../components/routines/RoutinesView'))
const ProjectsView = lazy(() => import('../components/projects/ProjectsView'))
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
import { useSomeday         } from '../hooks/useSomeday'
import { useTemplates       } from '../hooks/useTemplates'
import { useEnergy          } from '../hooks/useEnergy'
import { useDailyScore      } from '../hooks/useDailyScore'
import { usePomodoroHistory } from '../hooks/usePomodoroHistory'
import { useHabitRules      } from '../hooks/useHabitRules'
import { useIdeas           } from '../hooks/useIdeas'
import { useRoutines        } from '../hooks/useRoutines'
import { useProjects        } from '../hooks/useProjects'
import { useBookmarks       } from '../hooks/useBookmarks'
import { useWorkouts        } from '../hooks/useWorkouts'
import { useCustomCategories } from '../hooks/useCustomCategories'
import { useMoodTheme       } from '../hooks/useMoodTheme'
import { useOnboarding     } from '../hooks/useOnboarding'
import { useTimeblocks    } from '../hooks/useTimeblocks'
import { useDailyPriorities } from '../hooks/useDailyPriorities'
import { usePersistedState } from '../hooks/usePersistedState'
import OnboardingFlow       from '../components/onboarding/OnboardingFlow'
import FeatureTooltip       from '../components/ui/FeatureTooltip'
import { spawnRecurringTasks }    from '../services/recurringEngine'
import { spawnRecurringWorkouts } from '../services/recurringWorkoutsEngine'
import { getTodayKey }            from '../utils/dateUtils'

// ── Weekly Review overlay helpers ───────────────────────────────────────────
const isSundayToday = () => new Date().getDay() === 0
const weeklyReviewDismissKey = () => `df_wr_dismissed_${getTodayKey()}`

// Legacy tab ids now consolidated into the single 'capture' tab — kept as a
// map so old bookmarked hashes, keyboard shortcuts, and widget "jump to X"
// buttons still land on the right sub-tab within CaptureView.
const LEGACY_CAPTURE_TABS = ['notes', 'ideas', 'braindump', 'bookmarks']

export default function DashboardPage() {
  // Tab state persisted in URL hash so refresh preserves current tab
  const [activeTab, setActiveTabRaw] = useState(() => {
    const hash = window.location.hash.slice(1)
    if (LEGACY_CAPTURE_TABS.includes(hash)) return 'capture'
    const valid = ['today','tasks','habits','focus','calendar','timeblock','projects',
      'capture','workouts','routines',
      'goals','insights','search','weeklyreview']
    return valid.includes(hash) ? hash : 'today'
  })

  // Which capture sub-type CaptureView should show — defaults to 'notes',
  // but "jump straight to X" callers (keyboard shortcuts, Today widgets,
  // reflection prompt, share-target) route through here via setActiveTab.
  const [captureType, setCaptureType] = useState(() => {
    const hash = window.location.hash.slice(1)
    return LEGACY_CAPTURE_TABS.includes(hash) ? hash : 'notes'
  })

  const setActiveTab = useCallback((tab) => {
    if (LEGACY_CAPTURE_TABS.includes(tab)) {
      setCaptureType(tab)
      setActiveTabRaw('capture')
      window.history.replaceState(null, '', '#capture')
      return
    }
    setActiveTabRaw(tab)
    window.history.replaceState(null, '', `#${tab}`)
  }, [])

  const [showQuickCapture, setShowQuickCapture] = useState(false)

  // Deep-link: open a specific task's detail modal from a notification tap
  // (e.g. ?openTask=<id>). We capture the id into local state — rather than
  // reading searchParams.get('openTask') directly on every render — because
  // clearing the query param below triggers a re-render where searchParams
  // would already be empty. Local state keeps the id stable across that
  // re-render so TasksView's mount effect still sees a non-null value.
  const [searchParams, setSearchParams] = useSearchParams()
  const [openTaskId, setOpenTaskId] = useState(() => searchParams.get('openTask'))
  const [focusTaskId, setFocusTaskId] = useState(() => searchParams.get('focusTask'))

  useEffect(() => {
    const id = searchParams.get('openTask')
    if (id) {
      setActiveTab('tasks')
      setOpenTaskId(id)
      // Clear the param so it doesn't re-trigger on next render/refresh
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.delete('openTask')
        return next
      }, { replace: true })
    }
  }, [searchParams])

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
  const dailyPriorities = useDailyPriorities(tasks.tasks)
  const notes           = useNotes()
  const habits          = useHabits()
  const mood            = useMood()
  const intention       = useIntention()
  const goals           = useGoals()
  const someday         = useSomeday()
  const templates       = useTemplates()
  const energy          = useEnergy()
  const pomodoroHistory = usePomodoroHistory()
  const habitRules      = useHabitRules()
  const ideas           = useIdeas()
  const routines        = useRoutines()
  const projects        = useProjects()
  const bookmarks       = useBookmarks()
  const workouts        = useWorkouts()
  const catData         = useCustomCategories()
  const { theme, setTheme } = useTheme()
  const { user }             = useAuth()
  const moodTheme  = useMoodTheme(mood, theme)
  const onboarding  = useOnboarding()
  const timeblocks  = useTimeblocks()
  const score = useDailyScore({ tasks, habits, mood })

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

  const startFocus = useCallback(taskId => {
    const next = new URL(window.location.href)
    next.searchParams.set('focusTask', taskId)
    window.history.replaceState(null, '', `${next.pathname}${next.search}${next.hash}`)
    setFocusTaskId(String(taskId))
    setActiveTab('focus')
  }, [setActiveTab])

  const finishFocus = useCallback(() => {
    const next = new URL(window.location.href)
    next.searchParams.delete('focusTask')
    window.history.replaceState(null, '', `${next.pathname}${next.search}${next.hash}`)
    setFocusTaskId(null)
    setActiveTab('today')
  }, [setActiveTab])

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
      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange} theme={theme} onSetTheme={setTheme} tasks={tasks}>
      <ViewErrorBoundary key={activeTab}>

        {/* ── Plan ─────────────────────────────────────────────────────────── */}
        {activeTab === 'today'      && <TodayView tasks={tasks} habits={habits} notes={notes} mood={mood} intention={intention} score={score} energy={energy} onTabChange={handleTabChange} goals={goals} projects={projects} workouts={workouts} ideas={ideas} timeblocks={timeblocks} dailyPriorities={dailyPriorities} onStartFocus={startFocus} />}
        {activeTab === 'tasks'      && <TasksView tasks={tasks} templates={templates} someday={someday} projects={projects.projects} categories={catData.all} onAddCategory={catData.addCategory} onRemoveCategory={catData.removeCategory} onTabChange={handleTabChange} energy={energy} habits={habits} ideas={ideas} openTaskId={openTaskId} workouts={workouts} />}
        {activeTab === 'calendar'   && <CalendarView tasks={tasks} categories={catData.all} onAddCategory={catData.addCategory} onRemoveCategory={catData.removeCategory} />}
        {activeTab === 'timeblock'  && <TimeBlockView tasks={tasks} />}
        {activeTab === 'projects'   && <ProjectsView projects={projects} tasks={tasks} />}

        {/* ── Build ────────────────────────────────────────────────────────── */}
        {activeTab === 'habits'     && <HabitsView habits={habits} habitRules={habitRules} />}
        {activeTab === 'routines'   && <RoutinesView routines={routines} />}
        {activeTab === 'goals'      && <GoalsView goals={goals} />}
        {activeTab === 'workouts'   && <WorkoutsView workouts={workouts} />}

        {/* ── Think ────────────────────────────────────────────────────────── */}
        {activeTab === 'capture'    && <CaptureView notes={notes} ideas={ideas} bookmarks={bookmarks} tasks={tasks} goals={goals} categories={catData.all} onAddCategory={catData.addCategory} onRemoveCategory={catData.removeCategory} initialType={captureType} />}

        {/* ── Reflect ──────────────────────────────────────────────────────── */}
        {activeTab === 'insights'   && <InsightsView mood={mood} habits={habits} tasks={tasks} notes={notes} theme={theme} onSetTheme={setTheme} onWriteNote={handleWriteNote} intentions={intention} energy={energy} goals={goals} moodTheme={moodTheme} workouts={workouts} ideas={ideas} bookmarks={bookmarks} />}
        {activeTab === 'focus'      && <FocusMode tasks={tasks} pomodoroHistory={pomodoroHistory} selectedTaskId={focusTaskId} onComplete={finishFocus} />}
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
