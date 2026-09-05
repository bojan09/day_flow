// Service: reflectionSchedule
// Purpose: Decide which half of the reflection is due right now, from the
//          clock and what has already been completed today.
//
// The ritual is two separate moments, not one form. Finishing the morning must
// never roll straight into the evening: the evening asks how the day went, and
// at 8am there is no day to report on yet. So the evening only opens once the
// evening window actually arrives.
//
// Pure, so the boundaries are testable without React or a fake clock.

export const MORNING_START = 5    // 05:00 — before this it is still night
export const MIDDAY_START   = 12  // morning window closes
export const EVENING_START  = 17  // evening window opens
export const NIGHT_START    = 22  // late; still allowed, just called night

/** 'night' | 'morning' | 'midday' | 'evening' */
export function reflectionPhase(hour) {
  if (hour < MORNING_START) return 'night'
  if (hour < MIDDAY_START)  return 'morning'
  if (hour < EVENING_START) return 'midday'
  if (hour < NIGHT_START)   return 'evening'
  return 'night'
}

/**
 * Which half the app should offer right now.
 * @returns {'morning'|'evening'|null}
 */
export function dueReflection({ hour, morningDone, eveningDone }) {
  const phase = reflectionPhase(hour)

  // From the evening onwards (including late night) the day is reviewable.
  if (phase === 'evening' || (phase === 'night' && hour >= NIGHT_START)) {
    return eveningDone ? null : 'evening'
  }

  // Before the evening the only thing on offer is the morning — and a morning
  // missed at 9am is still worth setting at 1pm, so it stays available through
  // midday rather than vanishing at noon.
  if (phase === 'morning' || phase === 'midday') {
    return morningDone ? null : 'morning'
  }

  return null
}

/** Copy for the contextual prompt, so Today and the reminder agree. */
export function promptCopy(due) {
  if (due === 'morning') {
    return { title: 'Begin your day', body: 'Set an intention before the day sets one for you.' }
  }
  if (due === 'evening') {
    return { title: 'Close your day', body: 'Take a moment to understand today before letting it go.' }
  }
  return null
}

/**
 * Whether to raise a reminder notification now.
 *
 * Deliberately at most one per half per day: the spec is explicit that the
 * principle must not be pushed at the user repeatedly, and a reflection app
 * that nags is a reflection app people mute.
 */
export function shouldRemind({ hour, morningDone, eveningDone, remindedFor = [] }) {
  const due = dueReflection({ hour, morningDone, eveningDone })
  if (!due) return null
  if (remindedFor.includes(due)) return null
  // Don't ambush someone opening the app at 05:01 — wait for a civil hour.
  if (due === 'morning' && hour < 7) return null
  return due
}
