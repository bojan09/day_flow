// Page: DashboardPage
// Purpose: Owns all app state, spawns recurring tasks on mount, renders active tab
import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import TodayView    from '../components/today/TodayView'
import TasksView    from '../components/tasks/TasksView'
import NotesView    from '../components/notes/NotesView'
import HabitsView   from '../components/habits/HabitsView'
import InsightsView from '../components/insights/InsightsView'
import WeeklyReview from '../components/weekly/WeeklyReview'
import { useTasks      } from '../hooks/useTasks'
import { useNotes      } from '../hooks/useNotes'
import { useHabits     } from '../hooks/useHabits'
import { useMood       } from '../hooks/useMood'
import { useTheme      } from '../hooks/useTheme'
import { useIntention  } from '../hooks/useIntention'
import { spawnRecurringTasks } from '../services/recurringEngine'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('today')
  const tasks     = useTasks()
  const notes     = useNotes()
  const habits    = useHabits()
  const mood      = useMood()
  const intention = useIntention()
  const { theme, setTheme } = useTheme()

  // Spawn recurring task instances for today on mount
  useEffect(() => {
    spawnRecurringTasks(tasks.tasks, tasks.addTask)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleWriteNote = (prompt) => {
    notes.addNote({ title: 'Reflection', content: `Prompt: ${prompt}\n\n` })
    setActiveTab('notes')
  }

  return (
    <>
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'today' && (
          <TodayView tasks={tasks} habits={habits} notes={notes} mood={mood} intention={intention} />
        )}
        {activeTab === 'tasks'  && <TasksView  tasks={tasks} />}
        {activeTab === 'notes'  && <NotesView  notes={notes} />}
        {activeTab === 'habits' && <HabitsView habits={habits} />}
        {activeTab === 'insights' && (
          <InsightsView
            mood={mood} habits={habits} tasks={tasks} notes={notes}
            theme={theme} onSetTheme={setTheme}
            onWriteNote={handleWriteNote}
            intentions={intention}
          />
        )}
      </DashboardLayout>

      {/* Sunday weekly review modal */}
      <WeeklyReview tasks={tasks} habits={habits} mood={mood} />
    </>
  )
}
