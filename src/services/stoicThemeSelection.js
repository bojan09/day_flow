// Service: stoicThemeSelection
// Purpose: Choose WHICH Stoic theme to show, from the day's actual context.
//          The spec is explicit: "Do not randomly display quotes every day.
//          Select a relevant theme when sufficient context exists."
//
// Pure and dependency-free so the precedence rules can be tested directly.
import { STOIC_REFERENCES, referenceByTheme } from './stoicReferences.js'

// Ordered by precedence — the first rule whose condition holds wins.
// Each says, in plain terms, why that theme fits that situation.
const RULES = [
  {
    theme: 'adversity',
    when: ({ overdueCount }) => overdueCount >= 5,
    why: 'A backlog has built up',
  },
  {
    theme: 'control',
    when: ({ todayTaskCount }) => todayTaskCount >= 8,
    why: 'A heavy day — worth separating what you govern from what you do not',
  },
  {
    theme: 'discipline',
    when: ({ yesterdayLivedIntention }) => yesterdayLivedIntention === 'not_today',
    why: 'Yesterday did not go to intention',
  },
  {
    theme: 'responsibility',
    when: ({ hasCarryForward }) => hasCarryForward,
    why: 'You left yourself a note yesterday',
  },
  {
    theme: 'patience',
    when: ({ yesterdayLivedIntention }) => yesterdayLivedIntention === 'partially',
    why: 'Yesterday went partly to plan',
  },
  {
    theme: 'presence',
    when: ({ todayTaskCount, overdueCount }) => todayTaskCount === 0 && overdueCount === 0,
    why: 'An open day',
  },
]

/**
 * Pick a theme from context, or null when there isn't enough signal —
 * the spec only wants a context-driven theme "when sufficient context exists".
 */
export function selectTheme(context = {}) {
  const ctx = {
    overdueCount: 0,
    todayTaskCount: 0,
    yesterdayLivedIntention: null,
    hasCarryForward: false,
    ...context,
  }
  const hit = RULES.find(rule => rule.when(ctx))
  return hit ? { theme: hit.theme, why: hit.why } : null
}

/**
 * Resolve context to an actual reference. Falls back to a stable rotation
 * when no rule fires, or when the chosen theme has no verified quote yet —
 * the curated set is deliberately small, so that gap is expected.
 */
export function selectReference(dateKey, context = {}, pool = STOIC_REFERENCES) {
  if (!pool.length) return null
  const picked = selectTheme(context)

  if (picked) {
    const matches = referenceByTheme(picked.theme, pool)
    if (matches.length) {
      return { ...rotate(matches, dateKey), reason: picked.why, theme: picked.theme }
    }
  }
  // No rule fired, or nothing verified for that theme: rotate the whole set by
  // date so the same day is stable rather than reshuffling on every render.
  return { ...rotate(pool, dateKey), reason: null, theme: null }
}

// Deterministic per-day pick — same day, same reference.
function rotate(list, dateKey) {
  const n = String(dateKey).split('-').reduce((sum, part) => sum + Number(part), 0)
  return list[n % list.length]
}
