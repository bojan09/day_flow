// Service: captureClassifier
// Purpose: Classify a single free-text capture into an intent + extracted
//          fields, entirely on-device.
//
// This used to call an AI proxy and fall back to the local parser whenever the
// call failed. The AI dependency is gone, so the local parser is now the whole
// implementation — which also means capture is instant, works offline, and
// cannot be broken by an upstream model being retired.
//
// Kept non-async-looking but safe to `await`: callers still write
// `await classifyCapture(text)`, and awaiting a plain value is a no-op.
import { parseNLTask } from './nlpParser.js'

const HABIT_RE   = /^(every ?day|daily|each day|habit:)\s*/i
const ROUTINE_RE = /^(routine:|morning routine|evening routine)\s*/i
const EVENT_RE   = /\b(at|from)\s+\d{1,2}(:\d{2})?\s*(am|pm)?\b/i

/**
 * @param {string} text - raw capture text
 * @returns {{type: string, fields: object}}
 */
export function classifyCapture(text) {
  const raw = String(text || '').trim()
  if (!raw) return { type: 'task', fields: { title: '' } }

  if (ROUTINE_RE.test(raw)) {
    return { type: 'routine', fields: { name: raw.replace(ROUTINE_RE, '').trim() || raw, steps: [] } }
  }

  if (HABIT_RE.test(raw)) {
    return { type: 'habit', fields: { name: raw.replace(HABIT_RE, '').trim() || raw, frequency: 'daily' } }
  }

  const parsed = parseNLTask(raw)

  // A time reference makes it an event rather than a plain task.
  if (EVENT_RE.test(raw)) {
    return {
      type: 'event',
      fields: { title: parsed?.title || raw, date: parsed?.date || null, time: parsed?.time || null },
    }
  }

  return { type: 'task', fields: parsed || { title: raw } }
}
