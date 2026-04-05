// Page: DashboardPage
// Purpose: Owns all shared state and renders the correct tab view
import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import TodayView    from '../components/today/TodayView'
import TasksView    from '../components/tasks/TasksView'
import NotesView    from '../components/notes/NotesView'
import HabitsView   from '../components/habits/HabitsView'
import InsightsView from '../components/insights/InsightsView'
import { useTasks  } from '../hooks/useTasks'
import { useNotes  } from '../hooks/useNotes'
import { useHabits } from '../hooks/useHabits'
import { useMood   } from '../hooks/useMood'
import { useTheme  } from '../hooks/useTheme'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('today')
  const tasks  = useTasks()
  const notes  = useNotes()
  const habits = useHabits()
  const mood   = useMood()
  const { theme, setTheme } = useTheme()

  // When reflection prompt triggers "write about this", switch to notes and create one
  const handleWriteNote = (prompt) => {
    const note = notes.addNote({ title: 'Reflection', content: `Prompt: ${prompt}\n\n` })
    setActiveTab('notes')
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today'    && <TodayView tasks={tasks} habits={habits} notes={notes} mood={mood} />}
      {activeTab === 'tasks'    && <TasksView tasks={tasks} />}
      {activeTab === 'notes'    && <NotesView notes={notes} />}
      {activeTab === 'habits'   && <HabitsView habits={habits} />}
      {activeTab === 'insights' && (
        <InsightsView
          mood={mood}
          habits={habits}
          tasks={tasks}
          theme={theme}
          onSetTheme={setTheme}
          onWriteNote={handleWriteNote}
        />
      )}
    </DashboardLayout>
  )
}
