// Service: captureClassifier
// Purpose: Classify a single free-text capture into task/habit/routine/event
//          intent + extracted fields, using the AI proxy. Falls back to the
//          existing local task-only parser (nlpParser.js) whenever the AI
//          call fails, is rate-limited, or returns something unparseable —
//          capture must never be blocked by AI unavailability.
import { parseNLTask } from './nlpParser.js'

const VALID_TYPES = ['task', 'habit', 'routine', 'event']

const SYSTEM_PROMPT = `You classify a short piece of user-typed text into one of: task, habit, routine, event.
Respond with ONLY a JSON object, no prose, no markdown fences, in this exact shape:
{"type": "task|habit|routine|event", "fields": { ... relevant extracted fields ... }}
For type "task": fields = {title, date (YYYY-MM-DD or null), priority (high|medium|low), category}.
For type "habit": fields = {name, frequency (daily|weekly|custom)}.
For type "routine": fields = {name, steps: [string, ...]}.
For type "event": fields = {title, date (YYYY-MM-DD or null), time (HH:MM or null)}.
If unsure, prefer "task".`

function localFallback(text) {
  const parsed = parseNLTask(text)
  return { type: 'task', fields: parsed, usedFallback: true }
}

/**
 * @param {string} text - raw capture text
 * @param {(system: string, message: string) => Promise<string>} caller - injected
 *        AI-call function (defaults to the real callClaude proxy wrapper; tests
 *        inject a fake so this module has no network dependency in tests).
 */
export async function classifyCapture(text, caller) {
  if (!caller) {
    const { callClaude } = await import('./aiService.js')
    caller = callClaude
  }

  let raw
  try {
    raw = await caller(SYSTEM_PROMPT, text)
  } catch {
    return localFallback(text)
  }

  let parsed
  try {
    parsed = JSON.parse(raw.trim())
  } catch {
    return localFallback(text)
  }

  if (!parsed || !VALID_TYPES.includes(parsed.type) || typeof parsed.fields !== 'object' || parsed.fields === null) {
    return localFallback(text)
  }

  return { type: parsed.type, fields: parsed.fields, usedFallback: false }
}
