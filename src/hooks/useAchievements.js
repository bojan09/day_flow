// Hook: useAchievements
// Purpose: Tracks which achievements the user has unlocked.
//          Checks current data against milestone thresholds on every call.
import { useState, useEffect, useCallback } from 'react'
import { storage } from '../services/storage'

const KEY = 'achievements_unlocked'

export const ACHIEVEMENTS = [
  // Tasks
  { id: 'first_task',       category: 'Tasks',    icon: '✅', title: 'First Step',        desc: 'Complete your first task',                 check: (d) => d.tasksCompleted >= 1    },
  { id: 'task_10',          category: 'Tasks',    icon: '🔟', title: 'On a Roll',          desc: 'Complete 10 tasks',                        check: (d) => d.tasksCompleted >= 10   },
  { id: 'task_50',          category: 'Tasks',    icon: '💪', title: 'Task Master',        desc: 'Complete 50 tasks',                        check: (d) => d.tasksCompleted >= 50   },
  { id: 'task_100',         category: 'Tasks',    icon: '🏅', title: 'Century Club',       desc: 'Complete 100 tasks',                       check: (d) => d.tasksCompleted >= 100  },
  { id: 'task_streak_7',    category: 'Tasks',    icon: '🔥', title: 'Week Warrior',       desc: 'Complete tasks 7 days in a row',           check: (d) => d.taskStreak >= 7        },

  // Habits
  { id: 'first_habit',      category: 'Habits',   icon: '🌱', title: 'Habit Seed',         desc: 'Log a habit for the first time',           check: (d) => d.habitDays >= 1         },
  { id: 'habit_7',          category: 'Habits',   icon: '📅', title: 'Week of Wins',       desc: 'Log habits 7 days in a row',               check: (d) => d.habitStreak >= 7       },
  { id: 'habit_30',         category: 'Habits',   icon: '🌿', title: 'Month Strong',       desc: 'Log habits 30 days in a row',              check: (d) => d.habitStreak >= 30      },
  { id: 'habit_100',        category: 'Habits',   icon: '💎', title: 'Diamond Habit',      desc: 'Log habits 100 days in a row',             check: (d) => d.habitStreak >= 100     },

  // Notes
  { id: 'first_note',       category: 'Journal',  icon: '📝', title: 'First Words',        desc: 'Write your first note',                    check: (d) => d.notesWritten >= 1      },
  { id: 'note_10',          category: 'Journal',  icon: '📖', title: 'Chronicler',         desc: 'Write 10 notes',                           check: (d) => d.notesWritten >= 10     },
  { id: 'note_50',          category: 'Journal',  icon: '🗒️', title: 'Storyteller',        desc: 'Write 50 notes',                           check: (d) => d.notesWritten >= 50     },

  // Goals
  { id: 'first_goal',       category: 'Goals',    icon: '🎯', title: 'Dream Big',          desc: 'Create your first goal',                   check: (d) => d.goalsCreated >= 1      },
  { id: 'goal_complete',    category: 'Goals',    icon: '🏆', title: 'Goal Getter',        desc: 'Complete your first goal',                 check: (d) => d.goalsCompleted >= 1    },
  { id: 'goals_5',          category: 'Goals',    icon: '⭐', title: 'Visionary',          desc: 'Complete 5 goals',                         check: (d) => d.goalsCompleted >= 5    },

  // Focus
  { id: 'first_pomodoro',   category: 'Focus',    icon: '⏱️', title: 'Deep Diver',         desc: 'Complete your first focus session',        check: (d) => d.pomodoroSessions >= 1  },
  { id: 'pomodoro_10',      category: 'Focus',    icon: '🍅', title: 'Flow State',         desc: 'Complete 10 focus sessions',               check: (d) => d.pomodoroSessions >= 10 },
  { id: 'pomodoro_50',      category: 'Focus',    icon: '🔮', title: 'Deep Worker',        desc: 'Complete 50 focus sessions',               check: (d) => d.pomodoroSessions >= 50 },

  // Workouts
  { id: 'first_workout',    category: 'Fitness',  icon: '🏋️', title: 'First Rep',          desc: 'Log your first workout',                   check: (d) => d.workoutsLogged >= 1    },
  { id: 'workout_10',       category: 'Fitness',  icon: '💪', title: 'Getting Fit',        desc: 'Log 10 workouts',                          check: (d) => d.workoutsLogged >= 10   },
  { id: 'workout_pb',       category: 'Fitness',  icon: '🥇', title: 'Personal Best',      desc: 'Record your first personal best',          check: (d) => d.personalBests >= 1     },

  // Mood
  { id: 'mood_7',           category: 'Wellbeing',icon: '😊', title: 'Self-Aware',         desc: 'Log mood 7 days in a row',                 check: (d) => d.moodStreak >= 7        },
  { id: 'mood_30',          category: 'Wellbeing',icon: '🧘', title: 'Mindful Month',      desc: 'Log mood 30 days in a row',                check: (d) => d.moodStreak >= 30       },

  // XP / Level
  { id: 'level_3',          category: 'Growth',   icon: '🌳', title: 'Sapling',            desc: 'Reach level 3',                            check: (d) => d.level >= 3             },
  { id: 'level_5',          category: 'Growth',   icon: '🧭', title: 'Explorer',           desc: 'Reach level 5',                            check: (d) => d.level >= 5             },
  { id: 'level_10',         category: 'Growth',   icon: '🚀', title: 'Visionary',          desc: 'Reach level 10',                           check: (d) => d.level >= 10            },
]

export function useAchievements({ tasks, habits, notes, goals, xp, workouts, mood }) {
  const [unlocked, setUnlocked] = useState(() => storage.get(KEY, {}))

  useEffect(() => { storage.set(KEY, unlocked) }, [unlocked])

  // Build data snapshot for threshold checks
  const getData = useCallback(() => {
    const tasksCompleted = tasks.tasks.filter(t => t.completed).length
    const habitStreak    = habits.habits.length > 0
      ? Math.max(...habits.habits.map(h => habits.getStreak(h.id)), 0)
      : 0
    const habitDays  = Object.keys(storage.get('habit_log', {})).length > 0 ? 1 : 0
    const moodHistory = Object.values(storage.get('moods', {}))
    // Simple consecutive mood streak
    let moodStreak = 0
    const today = new Date()
    for (let i = 0; i < 90; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      if (moodHistory.find(m => m.date === key)) moodStreak++
      else break
    }
    // Task streak (days with at least 1 completed task)
    let taskStreak = 0
    for (let i = 0; i < 90; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      if (tasks.tasks.some(t => t.date === key && t.completed)) taskStreak++
      else break
    }

    const levelInfo = xp?.getLevelInfo?.()

    return {
      tasksCompleted,
      taskStreak,
      habitStreak,
      habitDays,
      notesWritten:     notes.notes.length,
      goalsCreated:     goals.goals.length,
      goalsCompleted:   goals.goals.filter(g => g.completed).length,
      pomodoroSessions: storage.get('pomodoro_history', []).length,
      workoutsLogged:   workouts?.sessions?.length ?? 0,
      personalBests:    workouts?.getPersonalBests?.()?.length ?? 0,
      moodStreak,
      // getLevelInfo returns { level, title, min, next, progress, totalXP } — not { current }
      level:            levelInfo?.level ?? 1,
    }
  }, [tasks, habits, notes, goals, xp, workouts])

  // Check for newly unlocked achievements
  const checkAchievements = useCallback(() => {
    const data    = getData()
    const newlyUnlocked = []

    ACHIEVEMENTS.forEach(a => {
      if (!unlocked[a.id] && a.check(data)) {
        newlyUnlocked.push(a)
      }
    })

    if (newlyUnlocked.length > 0) {
      setUnlocked(prev => {
        const next = { ...prev }
        const now  = new Date().toISOString()
        newlyUnlocked.forEach(a => { next[a.id] = now })
        return next
      })
    }

    return newlyUnlocked
  }, [getData, unlocked])

  const unlockedList = ACHIEVEMENTS.filter(a => unlocked[a.id])
    .map(a => ({ ...a, unlockedAt: unlocked[a.id] }))
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))

  const lockedList = ACHIEVEMENTS.filter(a => !unlocked[a.id])

  const byCategory = ACHIEVEMENTS.reduce((acc, a) => {
    if (!acc[a.category]) acc[a.category] = { total: 0, unlocked: 0 }
    acc[a.category].total++
    if (unlocked[a.id]) acc[a.category].unlocked++
    return acc
  }, {})

  return {
    unlocked,
    unlockedList,
    lockedList,
    byCategory,
    checkAchievements,
    totalUnlocked: unlockedList.length,
    totalPossible: ACHIEVEMENTS.length,
  }
}
