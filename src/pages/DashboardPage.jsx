// Page: DashboardPage
// Purpose: Owns all shared state (tasks, notes, habits) and renders the correct tab view
import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import TodayView  from '../components/today/TodayView'
import TasksView  from '../components/tasks/TasksView'
import NotesView  from '../components/notes/NotesView'
import HabitsView from '../components/habits/HabitsView'
import { useTasks  } from '../hooks/useTasks'
import { useNotes  } from '../hooks/useNotes'
import { useHabits } from '../hooks/useHabits'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('today')

  // All shared state lives here and is passed down
  const tasks  = useTasks()
  const notes  = useNotes()
  const habits = useHabits()

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today'  && <TodayView  tasks={tasks}  habits={habits} notes={notes} />}
      {activeTab === 'tasks'  && <TasksView  tasks={tasks} />}
      {activeTab === 'notes'  && <NotesView  notes={notes} />}
      {activeTab === 'habits' && <HabitsView habits={habits} />}
    </DashboardLayout>
  )
}
