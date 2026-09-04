// Page: DashboardPage
// Purpose: Root app page — owns all state hooks, renders active tab.
//          Hosts QuickCapture + KeyboardShortcuts as global overlays.
import { useState, useEffect, lazy, Suspense, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import DashboardLayout    from '../layouts/DashboardLayout'
import TabSkeleton        from '../components/ui/TabSkeleton'
import ViewErrorBoundary  from '../components/ui/ViewErrorBoundary'
import TodayView          from '../components/today/TodayView'
import TasksView          from '../components/tasks/TasksView'
import FocusMode          from '../components/focus/FocusMode'
const SearchView = lazy(() => import('../components/search/SearchView'))
const InsightsView = lazy(() => import('../components/insights/InsightsView'))
const WorkoutsView = lazy(() => import('../components/workouts/WorkoutsView'))
const TimeBlockView = lazy(() => import('../components/timeblock/TimeBlockView'))
const CalendarView = lazy(() => import('../components/calendar/CalendarView'))
const CaptureView = lazy(() => import('../components/capture/CaptureView'))
const DailyRhythmView = lazy(() => import('../components/rhythm/DailyRhythmView'))
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
import { useEnergy          } from '../hooks/useEnergy'
import { useDailyScore      } from '../hooks/useDailyScore'
import { useIdeas           } from '../hooks/useIdeas'
import { useRoutines        } from '../hooks/useRoutines'
import { useProjects        } from '../hooks/useProjects'
import { useWorkouts        } from '../hooks/useWorkouts'
import { useCustomCategories } from '../hooks/useCustomCategories'
import { useMoodTheme       } from '../hooks/useMoodTheme'
import { useOnboarding     } from '../hooks/useOnboarding'
import { useTimeblocks    } from '../hooks/useTimeblocks'
import OnboardingFlow       from '../components/onboarding/OnboardingFlow'
import FeatureTooltip       from '../components/ui/FeatureTooltip'
import { stashPendingShare }      from '../services/pendingShare'
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

// Legacy standalone 'goals' tab — folded into TasksView's "Long-term" filter
// chip. Kept as a translation so old bookmarked hashes, keyboard shortcuts,
// and widget "jump to goals" buttons still land in the right place.
const LEGACY_GOALS_TAB = 'goals'

// Legacy standalone 'habits' and 'routines' tabs — folded into the single
// 'rhythm' ("Daily Rhythm") tab, which shows both sections at once. Kept as
// a translation so old bookmarked hashes, keyboard shortcuts, and widget
// "jump to X" buttons still land on the new destination. No sub-filter state
// is needed here (unlike the Goals fold) since both sections are always
// visible together.
const LEGACY_RHYTHM_TABS = ['habits', 'routines']

export default function DashboardPage() {
  // Tab state persisted in URL hash so refresh preserves current tab
  const [activeTab, setActiveTabRaw] = useState(() => {
    const hash = window.location.hash.slice(1)
    if (LEGACY_CAPTURE_TABS.includes(hash)) return 'capture'
    if (hash === LEGACY_GOALS_TAB) return 'tasks'
    if (LEGACY_RHYTHM_TABS.includes(hash)) return 'rhythm'
    const valid = ['today','tasks','rhythm','focus','calendar','timeblock','projects',
      'capture','workouts',
      'insights','search','weeklyreview']
    return valid.includes(hash) ? hash : 'today'
  })

  // Which capture sub-type CaptureView should show — defaults to 'notes',
  // but "jump straight to X" callers (keyboard shortcuts, Today widgets,
  // reflection prompt, share-target) route through here via setActiveTab.
  const [captureType, setCaptureType] = useState(() => {
    const hash = window.location.hash.slice(1)
    return LEGACY_CAPTURE_TABS.includes(hash) ? hash : 'notes'
  })

  // Which filter chip TasksView should open on — defaults to 'Today', but
  // legacy "goals" callers (keyboard shortcuts, Today widgets) route through
  // here via setActiveTab so they land on the "Long-term" chip inside Tasks.
  const [tasksInitialFilter, setTasksInitialFilter] = useState(() => {
    const hash = window.location.hash.slice(1)
    return hash === LEGACY_GOALS_TAB ? 'Long-term' : 'Today'
  })

  const setActiveTab = useCallback((tab) => {
    if (LEGACY_CAPTURE_TABS.includes(tab)) {
      setCaptureType(tab)
      setActiveTabRaw('capture')
      window.history.replaceState(null, '', '#capture')
      return
    }
    if (tab === LEGACY_GOALS_TAB) {
      setTasksInitialFilter('Long-term')
      setActiveTabRaw('tasks')
      window.history.replaceState(null, '', '#tasks')
      return
    }
    if (LEGACY_RHYTHM_TABS.includes(tab)) {
      setActiveTabRaw('rhythm')
      window.history.replaceState(null, '', '#rhythm')
      return
    }
    setActiveTabRaw(tab)
    window.history.replaceState(null, '', `#${tab}`)
  }, [])

  // Bumped to force QuickCapture open (PWA "Add task" shortcut).
  const [quickCaptureSignal, setQuickCaptureSignal] = useState(0)

  // Deep-link: open a specific task's detail modal from a notification tap
  // (e.g. ?openTask=<id>). We capture the id into local state — rather than
  // reading searchParams.get('openTask') directly on every render — because
  // clearing the query param below triggers a re-render where searchParams
  // would already be empty. Local state keeps the id stable across that
  // re-render so TasksView's mount effect still sees a non-null value.
  const [searchParams, setSearchParams] = useSearchParams()
  const [openTaskId, setOpenTaskId] = useState(() => searchParams.get('openTask'))

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
  // Runs on searchParams changes only; setActiveTab/setSearchParams are
  // stable and including them adds nothing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (action === 'add-task')  { setActiveTab('tasks');   setQuickCaptureSignal(n => n + 1) }
    if (action === 'log-mood')  { setActiveTab('today') }
    if (action === 'focus')     { setActiveTab('focus') }
    if (action === 'habits')    { setActiveTab('rhythm') }

    // Share target — stash the shared link and let CaptureView, which owns the
    // bookmarks hook, create it on arrival. Writing it here would mean loading
    // and subscribing to bookmarks on every session just for this one path.
    if (shareUrl || shareTitle) {
      const title = shareTitle || shareText || shareUrl || 'Shared link'
      const url   = shareUrl   || ''
      if (url || title) {
        stashPendingShare({ title: title.slice(0, 80), url, tags: ['shared'] })
        setActiveTab('bookmarks')
        // Clean URL params
        window.history.replaceState({}, '', '/')
      }
    }
  // Mount-only: reads PWA shortcut/share params from the launch URL.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Data hooks ──────────────────────────────────────────────────────────────
  const tasks           = useTasks()
  const notes           = useNotes()
  const habits          = useHabits()
  const mood            = useMood()
  const intention       = useIntention()
  const goals           = useGoals()
  const energy          = useEnergy()
  const ideas           = useIdeas()
  const routines        = useRoutines()
  const projects        = useProjects()
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
  // Fires once both sources report synced. Depending on the task and
  // workout arrays would re-run the spawner every time it added something.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tasks.synced, workouts.synced])

  const handleWriteNote = useCallback((prompt) => {
    notes.addNote({ title: 'Reflection', content: `Prompt: ${prompt}\n\n`, tags: ['reflection'] })
    setActiveTab('notes')
  // notes.addNote is stable enough here; depending on the whole notes
  // object would rebuild this callback on every note change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange} theme={theme} onSetTheme={setTheme} tasks={tasks}>
      <ViewErrorBoundary key={activeTab}>

        {/* ── Plan ─────────────────────────────────────────────────────────── */}
        {activeTab === 'today'      && <TodayView tasks={tasks} habits={habits} routines={routines} notes={notes} mood={mood} intention={intention} score={score} energy={energy} onTabChange={handleTabChange} goals={goals} projects={projects} workouts={workouts} ideas={ideas} timeblocks={timeblocks} />}
        {activeTab === 'tasks'      && <TasksView tasks={tasks} projects={projects.projects} categories={catData.all} onAddCategory={catData.addCategory} onRemoveCategory={catData.removeCategory} onTabChange={handleTabChange} energy={energy} habits={habits} ideas={ideas} openTaskId={openTaskId} workouts={workouts} goals={goals} initialFilter={tasksInitialFilter} />}
        {activeTab === 'calendar'   && <CalendarView tasks={tasks} categories={catData.all} onAddCategory={catData.addCategory} onRemoveCategory={catData.removeCategory} />}
        {activeTab === 'timeblock'  && <TimeBlockView tasks={tasks} />}
        {activeTab === 'projects'   && <ProjectsView projects={projects} tasks={tasks} />}

        {/* ── Build ────────────────────────────────────────────────────────── */}
        {activeTab === 'rhythm'     && <DailyRhythmView habits={habits} routines={routines} />}
        {activeTab === 'workouts'   && <WorkoutsView workouts={workouts} />}

        {/* ── Think ────────────────────────────────────────────────────────── */}
        {activeTab === 'capture'    && <CaptureView notes={notes} ideas={ideas} tasks={tasks} goals={goals} categories={catData.all} onAddCategory={catData.addCategory} onRemoveCategory={catData.removeCategory} initialType={captureType} />}

        {/* ── Reflect ──────────────────────────────────────────────────────── */}
        {activeTab === 'insights'   && <InsightsView mood={mood} habits={habits} tasks={tasks} notes={notes} theme={theme} onSetTheme={setTheme} onWriteNote={handleWriteNote} intentions={intention} energy={energy} goals={goals} moodTheme={moodTheme} workouts={workouts} ideas={ideas} />}
        {activeTab === 'focus'      && <FocusMode tasks={tasks} />}
        {activeTab === 'search'     && <SearchView tasks={tasks} notes={notes} habits={habits} goals={goals} ideas={ideas} />}

      </ViewErrorBoundary>
      </DashboardLayout>
      </Suspense>

      <QuickCapture tasks={tasks} ideas={ideas} notes={notes} habits={habits} openSignal={quickCaptureSignal} />

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
