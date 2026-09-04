// Service: reflectionModel
// Purpose: Pure shape + merge logic for Daily Reflection entries.
//          Kept free of React and Supabase so the rules that decide what
//          counts as "done" — and how a day's entry is built up across two
//          sittings — can be tested directly.

// One entry per day, filled in over two sittings: morning and evening.
// Fields map 1:1 to the questions in the feature spec.
export function emptyReflection(dateKey) {
  return {
    dateKey,
    // ── Morning ────────────────────────────────────────────────────────────
    intention:      '',     // "How do you want to approach today?"
    priorityText:   '',     // "What matters most today?" — free text
    priorityTaskId: null,   // …or a link to an existing task
    inControl:      '',     // "What is within your control today?"
    obstacle:       '',     // "What could get in your way?" (optional)
    stoicRef:       null,   // snapshot of the reference shown that morning
    morningDoneAt:  null,
    // ── Evening ────────────────────────────────────────────────────────────
    livedIntention: null,   // 'yes' | 'partially' | 'not_today'
    wentWell:       '',
    didntGoPlanned: '',
    lesson:         '',
    differently:    '',
    dayFelt:        '',     // "Calm", "Scattered", … or custom
    carryForward:   '',     // "What should tomorrow remember?"
    aiReflection:   '',     // Groq output, stored so it survives a reload
    eveningDoneAt:  null,
  }
}

// A sitting counts as complete once it has been submitted, which is what the
// *DoneAt stamps record. Content alone isn't enough: a user can leave every
// optional field blank and still have finished the morning.
export const isMorningDone = (entry) => !!entry?.morningDoneAt
export const isEveningDone = (entry) => !!entry?.eveningDoneAt

// Merge a patch into a day's entry without letting a partially-filled form
// clobber the other sitting. Unknown keys are dropped so a stray field can't
// grow the stored shape over time.
export function mergeReflection(existing, patch, dateKey) {
  const base = existing ?? emptyReflection(dateKey)
  const allowed = Object.keys(emptyReflection(dateKey))
  const clean = {}
  for (const key of allowed) {
    if (patch && Object.prototype.hasOwnProperty.call(patch, key)) clean[key] = patch[key]
  }
  return { ...base, ...clean, dateKey: base.dateKey ?? dateKey }
}

// Reflections are stored one KV blob per month rather than one blob for all
// history: the app's KV row is read whole on every load, so a single growing
// blob would get slower every day. A month caps it at ~30 entries.
export const shardKeyFor = (dateKey) => `reflections_${String(dateKey).slice(0, 7)}`

// Yesterday's carry-forward is what the next morning opens with.
// Built and serialised entirely in UTC: constructing a local-time Date and
// then calling toISOString() silently skips a day for anyone east of UTC.
export function previousDateKey(dateKey) {
  const [y, m, d] = String(dateKey).split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() - 1)
  return dt.toISOString().slice(0, 10)
}

// The spec is explicit that "Not today" is not a failure state, so the streak
// counts days reflected on, not days judged successful.
export function reflectionStreak(entriesByDate, todayKey) {
  let streak = 0
  let cursor = todayKey
  // Today not being done yet shouldn't zero out a run — start from yesterday.
  if (!isEveningDone(entriesByDate[cursor])) cursor = previousDateKey(cursor)
  while (isEveningDone(entriesByDate[cursor])) {
    streak++
    cursor = previousDateKey(cursor)
  }
  return streak
}
