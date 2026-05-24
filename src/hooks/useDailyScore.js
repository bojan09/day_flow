// Hook: useDailyScore
// Purpose: Calculate a daily score (0–100) and letter grade.
//          Memoised on task/habit/mood data — only recalculates when data changes.
import { useMemo }    from 'react'
import { getTodayKey } from '../utils/dateUtils'

export function useDailyScore({ tasks, habits, mood, gratitude, water }) {
  const today = getTodayKey()

  // Memoised today's score — only recalculates when underlying data changes
  const todayScore = useMemo(() => {
    const dayTasks   = (tasks?.tasks || []).filter(t => t.date === today)
    const done       = dayTasks.filter(t => t.completed).length
    const taskScore  = dayTasks.length > 0 ? (done / dayTasks.length) * 35 : 0
    const habitPct   = (habits?.getTodayCompletion?.() || 0) / 100
    const habitScore = habitPct * 30
    const hasMood    = !!mood?.getMoodForDate?.(today)
    const moodScore  = hasMood ? 15 : 0
    const gLines     = (gratitude?.getTodayEntry?.() || []).filter(l => l.trim()).length
    const gratScore  = (gLines / 3) * 10
    const waterPct   = water ? Math.min(1, (water.getTodayCount?.() || 0) / (water.GOAL || 8)) : 0
    const waterScore = waterPct * 10
    const total      = Math.round(taskScore + habitScore + moodScore + gratScore + waterScore)
    const grade      = total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : total >= 50 ? 'D' : 'F'
    const message    =
      total >= 90 ? 'Perfect day. You crushed it! 🏆'  :
      total >= 80 ? 'Excellent work. Keep it up! 🔥'    :
      total >= 70 ? 'Solid day. Good momentum. 💪'      :
      total >= 60 ? 'Decent day. Room to grow. 🌱'      :
      total >= 50 ? 'Tough day. Tomorrow is fresh. 🌅'  :
      total > 0   ? 'Rough one. Show up tomorrow. ❤️'   :
                    'Nothing logged yet. Start your day! ☀️'
    return {
      total, grade, message,
      breakdown: {
        tasks:     Math.round(taskScore),
        habits:    Math.round(habitScore),
        mood:      Math.round(moodScore),
        gratitude: Math.round(gratScore),
        water:     Math.round(waterScore),
      },
      meta: { tasksScheduled: dayTasks.length, tasksDone: done },
    }
  }, [tasks?.tasks, habits?.log, mood?.moods, gratitude, water, today])

  // calculate() kept for backward compat with components that call it
  const calculate = (dateKey = today) => {
    if (dateKey === today) return todayScore
    const dayTasks   = (tasks?.tasks || []).filter(t => t.date === dateKey)
    const done       = dayTasks.filter(t => t.completed).length
    const taskScore  = dayTasks.length > 0 ? (done / dayTasks.length) * 35 : 0
    const habitPct   = (habits?.getTodayCompletion?.() || 0) / 100
    const total      = Math.round(taskScore + habitPct * 30)
    const grade      = total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : total >= 50 ? 'D' : 'F'
    return { total, grade, message: '', breakdown: {}, meta: { tasksScheduled: dayTasks.length, tasksDone: done } }
  }

  return { calculate, ...todayScore }
}
