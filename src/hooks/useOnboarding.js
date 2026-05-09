// Hook: useOnboarding
// Purpose: Tracks whether the user has completed onboarding.
//          Persisted to Supabase via usePersistedState so it's device-consistent.
import { usePersistedState } from './usePersistedState'

export const STARTER_PACKS = {
  student: {
    label:  'Student',
    emoji:  '📚',
    desc:   'Study habits, assignment tracking, focus sessions',
    habits: [
      { name: 'Study for 2 hours',  icon: '📖', frequency: 'daily' },
      { name: 'Review notes',       icon: '📝', frequency: 'daily' },
      { name: 'No phone after 10pm',icon: '📵', frequency: 'daily' },
    ],
    tasks: [
      { title: 'Plan this week\'s assignments', priority: 'high',   category: 'Learning' },
      { title: 'Set up study schedule',         priority: 'medium', category: 'Learning' },
    ],
    goals: [
      { title: 'Finish semester strong', type: 'Monthly', emoji: '🎓' },
    ],
  },
  entrepreneur: {
    label:  'Entrepreneur',
    emoji:  '🚀',
    desc:   'Deep work blocks, revenue goals, daily reviews',
    habits: [
      { name: 'Morning deep work',   icon: '🧠', frequency: 'daily' },
      { name: 'Review metrics',      icon: '📊', frequency: 'daily' },
      { name: 'Exercise',            icon: '🏃', frequency: 'daily' },
    ],
    tasks: [
      { title: 'Define this week\'s #1 priority', priority: 'high',   category: 'Work' },
      { title: 'Block 3 hours for deep work',     priority: 'high',   category: 'Work' },
    ],
    goals: [
      { title: 'Hit monthly revenue target', type: 'Monthly', emoji: '💰' },
    ],
  },
  fitness: {
    label:  'Fitness',
    emoji:  '💪',
    desc:   'Workout tracking, nutrition, sleep habits',
    habits: [
      { name: 'Workout',        icon: '🏋️', frequency: 'daily' },
      { name: 'Drink 8 glasses',icon: '💧', frequency: 'daily' },
      { name: 'Sleep by 10pm', icon: '😴', frequency: 'daily' },
    ],
    tasks: [
      { title: 'Plan workout schedule', priority: 'high',   category: 'Health' },
      { title: 'Prep healthy meals',    priority: 'medium', category: 'Health' },
    ],
    goals: [
      { title: 'Complete 30-day fitness challenge', type: 'Monthly', emoji: '🏆' },
    ],
  },
  focus: {
    label:  'Focus',
    emoji:  '🎯',
    desc:   'Deep work, distraction blocking, mindfulness',
    habits: [
      { name: 'Meditate 10 min', icon: '🧘', frequency: 'daily' },
      { name: 'No social media before noon', icon: '📵', frequency: 'daily' },
      { name: 'Evening journal', icon: '✍️', frequency: 'daily' },
    ],
    tasks: [
      { title: 'Identify top 3 priorities for this week', priority: 'high',   category: 'Personal' },
      { title: 'Set up focus environment',                priority: 'medium', category: 'Personal' },
    ],
    goals: [
      { title: 'Build a deep work practice', type: 'Monthly', emoji: '🧠' },
    ],
  },
}

const DEFAULT_STATE = {
  completed:   false,
  step:        0,
  name:        '',
  pack:        null,
  theme:       'light',
  skipped:     false,
  completedAt: null,
}

export function useOnboarding() {
  const [state, setState] = usePersistedState('onboarding_v1', DEFAULT_STATE)

  const setStep        = (step)  => setState(s => ({ ...s, step }))
  const setName        = (name)  => setState(s => ({ ...s, name }))
  const setPack        = (pack)  => setState(s => ({ ...s, pack }))
  const setTheme       = (theme) => setState(s => ({ ...s, theme }))
  const complete       = ()      => setState(s => ({ ...s, completed: true, completedAt: new Date().toISOString() }))
  const skip           = ()      => setState(s => ({ ...s, skipped: true,   completed: true }))
  const reset          = ()      => setState(DEFAULT_STATE)

  const shouldShow = !state.completed && !state.skipped

  return { state, setStep, setName, setPack, setTheme, complete, skip, reset, shouldShow }
}
