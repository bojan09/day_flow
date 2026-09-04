// Service: weeklyReflection
// Purpose: Aggregate a week of daily reflections.
//
// Two spec constraints shape this:
//   - "After enough data exists" — the weekly view stays hidden until the user
//     has actually reflected on several days, so it can't greet them with an
//     empty template.
//   - "Do not state uncertain observations as facts" — this module reports
//     only what was counted. Interpretation is left to the AI step, which is
//     required to hedge, and to the user.
//
// Pure, so the thresholds and tallies are testable without React.
import { previousDateKey, isEveningDone } from './reflectionModel.js'

export const WEEK_DAYS = 7
// Three reflected days in the window is the point at which a "week" has enough
// substance to be worth showing. Below that it would just be a list of one.
export const MIN_DAYS_FOR_WEEKLY = 3

/** The last 7 date keys, most recent first. */
export function weekDateKeys(todayKey, days = WEEK_DAYS) {
  const keys = [todayKey]
  for (let i = 1; i < days; i++) keys.push(previousDateKey(keys[keys.length - 1]))
  return keys
}

/**
 * @param {object} entriesByDate  date key -> reflection entry
 * @param {string} todayKey
 */
export function buildWeeklyReflection(entriesByDate = {}, todayKey) {
  const keys    = weekDateKeys(todayKey)
  const entries = keys.map(k => entriesByDate[k]).filter(e => e && isEveningDone(e))

  const lived = { yes: 0, partially: 0, not_today: 0 }
  const intentionCounts = {}
  const lessons = []
  const carried = []
  const feelings = {}

  for (const e of entries) {
    if (e.livedIntention && lived[e.livedIntention] !== undefined) lived[e.livedIntention]++
    if (e.intention)    intentionCounts[e.intention] = (intentionCounts[e.intention] || 0) + 1
    if (e.dayFelt)      feelings[e.dayFelt] = (feelings[e.dayFelt] || 0) + 1
    if (e.lesson?.trim())       lessons.push({ dateKey: e.dateKey, text: e.lesson.trim() })
    if (e.carryForward?.trim()) carried.push({ dateKey: e.dateKey, text: e.carryForward.trim() })
  }

  const topOf = (counts) => {
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return sorted.length ? { value: sorted[0][0], count: sorted[0][1] } : null
  }

  return {
    daysReflected: entries.length,
    enough: entries.length >= MIN_DAYS_FOR_WEEKLY,
    lived,
    topIntention: topOf(intentionCounts),
    topFeeling:   topOf(feelings),
    lessons,
    carried,
    dateKeys: keys,
  }
}

/**
 * Facts block for the AI pattern step. Returns null when there isn't enough to
 * work with, so the caller shows nothing rather than generic filler.
 */
export function weeklyFactsForAI(weekly) {
  if (!weekly.enough) return null
  const lines = [
    `Days reflected on this week: ${weekly.daysReflected}`,
    `Lived according to intention — yes: ${weekly.lived.yes}, partially: ${weekly.lived.partially}, not today: ${weekly.lived.not_today}`,
  ]
  if (weekly.topIntention) lines.push(`Most chosen intention: ${weekly.topIntention.value} (${weekly.topIntention.count}x)`)
  if (weekly.topFeeling)   lines.push(`Most common description of the day: ${weekly.topFeeling.value} (${weekly.topFeeling.count}x)`)
  if (weekly.lessons.length) lines.push(`Lessons they wrote:\n${weekly.lessons.map(l => `- ${l.text}`).join('\n')}`)
  if (weekly.carried.length) lines.push(`Notes they left for the next day:\n${weekly.carried.map(c => `- ${c.text}`).join('\n')}`)
  return lines.join('\n')
}
