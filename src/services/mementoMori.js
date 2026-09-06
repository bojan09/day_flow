// Service: mementoMori
// Purpose: "The concept of limited time can occasionally appear... Use
//          sparingly. It should feel meaningful, not ominous." — spec §33.
//
// Deliberately not AI-generated and not a new set of invented one-liners:
// it reuses the curated, attributed 'mortality'-themed entries already in
// stoicReferences.js (Marcus Aurelius, Seneca, Epictetus), the same
// discipline the rest of the app holds to — no unattributed platitudes.
//
// Pure and date-driven, not random, so the gate is stable within a day
// (matches every other reference selector in the app) and testable.
import { STOIC_REFERENCES } from './stoicReferences.js'

// Roughly one day in seven — "occasionally", not a daily fixture.
const FREQUENCY = 7

function hashString(str) {
  let hash = 0
  const s = String(str)
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  return hash
}

/** Whether today is one of the occasional days this should appear at all. */
export function shouldShowMementoMori(dateKey) {
  return hashString(`memento-${dateKey}`) % FREQUENCY === 0
}

/**
 * The mortality-themed line for today, or null on a day it shouldn't show.
 * @param {string} dateKey
 * @param {Array}  pool - injectable for tests
 */
export function mementoMoriForDate(dateKey, pool = STOIC_REFERENCES) {
  if (!shouldShowMementoMori(dateKey)) return null
  const candidates = pool.filter(r => r.themes.includes('mortality'))
  if (!candidates.length) return null
  const idx = hashString(`memento-pick-${dateKey}`) % candidates.length
  return candidates[idx]
}
