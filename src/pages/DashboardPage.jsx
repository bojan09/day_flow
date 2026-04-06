// Page: DashboardPage
// Purpose: Owns ALL app state, spawns recurring tasks on mount, renders active tab
import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import TodayView     from '../components/today/TodayView'
import TasksView     from '../components/tasks/TasksView'
import NotesView     from '../components/notes/NotesView'
import HabitsView    from '../components/habits/HabitsView'
import GoalsView     from '../components/goals/GoalsView'
import FocusMode     from '../components/focus/FocusMode'
import SearchView    from '../components/search/SearchView'
import InsightsView  from '../components/insights/InsightsView'
import TimeBlockView from '../components/timeblock/TimeBlockView'
import WeeklyReview  from '../components/weekly/WeeklyReview'
import { useTasks     } from '../hooks/useTasks'
import { useNotes     } from '../hooks/useNotes'
import { useHabits    } from '../hooks/useHabits'
import { useMood      } from '../hooks/useMood'
import { useTheme     } from '../hooks/useTheme'
import { useIntention } from '../hooks/useIntention'
import { useGoals     } from '../hooks/useGoals'
import { useXP        } from '../hooks/useXP'
import { useSomeday   } from '../hooks/useSomeday'
import { useGratitude } from '../hooks/useGratitude'
import { useTemplates } from '../hooks/useTemplates'
import { spawnRecurringTasks } from '../services/recurringEngine'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('today')
  const tasks     = useTasks()
  const notes     = useNotes()
  const habits    = useHabits()
  const mood      = useMood()
  const intention = useIntention()
  const gratitude = useGratitude()
  const goals     = useGoals()
  const xp        = useXP()
  const someday   = useSomeday()
  const templates = useTemplates()
  const { theme, setTheme } = useTheme()

  useEffect(() => { spawnRecurringTasks(tasks.tasks, tasks.addTask) }, [])

  const handleWriteNote = (prompt) => {
    notes.addNote({ title: 'Reflection', content: `Prompt: ${prompt}\n\n`, tags: ['reflection'] })
    setActiveTab('notes')
  }

  return (
    <>
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'today'     && <TodayView tasks={tasks} habits={habits} notes={notes} mood={mood} intention={intention} gratitude={gratitude} />}
        {activeTab === 'tasks'     && <TasksView tasks={tasks} templates={templates} someday={someday} />}
        {activeTab === 'timeblock' && <TimeBlockView tasks={tasks} />}
        {activeTab === 'notes'     && <NotesView notes={notes} />}
        {activeTab === 'habits'    && <HabitsView habits={habits} />}
        {activeTab === 'goals'     && <GoalsView goals={goals} xp={xp} />}
        {activeTab === 'focus'     && <FocusMode tasks={tasks} xp={xp} />}
        {activeTab === 'search'    && <SearchView tasks={tasks} notes={notes} habits={habits} goals={goals} />}
        {activeTab === 'insights'  && (
          <InsightsView mood={mood} habits={habits} tasks={tasks} notes={notes}
            theme={theme} onSetTheme={setTheme} onWriteNote={handleWriteNote}
            intentions={intention} xp={xp} />
        )}
      </DashboardLayout>
      <WeeklyReview tasks={tasks} habits={habits} mood={mood} />
    </>
  )
}
