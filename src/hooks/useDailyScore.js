// Hook: useDailyScore
// Purpose: Calculate a daily score (0-100) and letter grade from tasks, habits, mood, gratitude
import { getTodayKey } from '../utils/dateUtils'

export function useDailyScore({ tasks, habits, mood, gratitude, water }) {
  const today = getTodayKey()

  const calculate = (dateKey = today) => {
    const dayTasks   = tasks.tasks.filter(t => t.date === dateKey)
    const done       = dayTasks.filter(t => t.completed).length
    const taskScore  = dayTasks.length > 0 ? (done / dayTasks.length) * 35 : 17.5  // max 35

    const habitPct   = habits.getTodayCompletion() / 100
    const habitScore = habitPct * 30  // max 30

    const hasMood    = !!mood.getMoodForDate(dateKey)
    const moodScore  = hasMood ? 15 : 0  // max 15

    const gLines     = gratitude.getTodayEntry().filter(l => l.trim()).length
    const gratScore  = (gLines / 3) * 10  // max 10

    const waterPct   = water ? Math.min(1, water.getTodayCount() / water.GOAL) : 0
    const waterScore = waterPct * 10  // max 10

    const total = Math.round(taskScore + habitScore + moodScore + gratScore + waterScore)

    const grade =
      total >= 90 ? 'A+' :
      total >= 80 ? 'A'  :
      total >= 70 ? 'B'  :
      total >= 60 ? 'C'  :
      total >= 50 ? 'D'  : 'F'

    const message =
      total >= 90 ? 'Perfect day. You crushed it! 🏆'     :
      total >= 80 ? 'Excellent work. Keep it up! 🔥'       :
      total >= 70 ? 'Solid day. Good momentum. 💪'         :
      total >= 60 ? 'Decent day. Room to grow. 🌱'         :
      total >= 50 ? 'Tough day. Tomorrow is fresh. 🌅'     :
                    'Rough one. Show up tomorrow. ❤️'

    return {
      total,
      grade,
      message,
      breakdown: {
        tasks:    Math.round(taskScore),
        habits:   Math.round(habitScore),
        mood:     Math.round(moodScore),
        gratitude: Math.round(gratScore),
        water:    Math.round(waterScore),
      }
    }
  }

  return { calculate }
}
