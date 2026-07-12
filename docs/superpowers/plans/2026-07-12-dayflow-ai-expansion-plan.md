# DayFlow AI Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved AI expansion spec (`docs/superpowers/specs/2026-07-12-dayflow-ai-expansion-design.md`) — migrate `/api/ai` from Anthropic to Groq's free tier, then add universal natural-language capture, an AI-assisted scheduling suggestion, and AI-generated routine/goal drafts, in that order.

**Architecture:** `api/ai.js` keeps its existing `{system, message} → {text}` contract so no caller changes for the provider swap itself. New AI capabilities are additive service functions (`src/services/captureClassifier.js`) that call the existing `callClaude` proxy wrapper and fall back to current local/heuristic behavior on failure — no feature becomes AI-dependent for basic function.

**Tech Stack:** Vercel serverless function (`api/ai.js`), Groq API (OpenAI-compatible chat completions), React 18 hooks/components, Node's built-in `node:test` runner for the logic-level tests (no new dependency).

**Testing approach:** `api/ai.js` and the new `captureClassifier.js` are plain functions with real branching logic (provider request shaping, fallback behavior) — these get real unit tests using `node:test` + `node:assert/strict`, run via `node --test`. UI wiring tasks (quick-capture routing, scheduler panel, routine/goal draft entry points) are verified via `npm run build` + manual dev-server check, same rationale as the rebrand plan (no component-test framework in this repo).

**No git commits.** User manages all commits manually — skip any commit step; just mark the checkbox done after verifying.

---

## File Structure

New files:
- `api/ai.test.js` — unit tests for the Groq-migrated proxy handler
- `src/services/captureClassifier.js` — AI-backed intent classification (task/habit/routine/event) with local fallback
- `src/services/captureClassifier.test.js` — unit tests for the classifier + fallback
- `src/services/routinePlanService.js` — AI-drafted routine/goal breakdown requests

Modified files:
- `api/ai.js` — swap Anthropic → Groq (endpoint, auth, request/response shape, rate-limit constants)
- `README.md` — env var docs (`GROQ_API_KEY` instead of `ANTHROPIC_API_KEY`)
- `src/components/quickcapture/QuickCapture.jsx` — route text through `captureClassifier` before falling back to `parseNLTask`
- `src/components/tasks/QuickTaskBar.jsx` — same routing for its quick-add path
- `src/hooks/useSmartScheduler.js` — add an AI-suggestion path alongside the existing heuristic `analysis`
- `src/components/tasks/SmartSchedulerPanel.jsx` — render AI suggestions with accept/dismiss
- `src/components/routines/RoutineEditor.jsx` — add "✨ Draft with AI" entry point (empty-routine state)
- `src/components/goals/AddGoalModal.jsx` — add "✨ Draft with AI" entry point for milestone breakdown

---

## Task 1: Migrate `api/ai.js` from Anthropic to Groq

**Files:**
- Modify: `api/ai.js`
- Create: `api/ai.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// api/ai.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import handler from './ai.js'

function mockReqRes({ method = 'POST', body = {}, headers = {} } = {}) {
  const req = { method, body, headers }
  const res = {
    statusCode: 200,
    _json: null,
    status(code) { this.statusCode = code; return this },
    json(payload) { this._json = payload; return this },
  }
  return { req, res }
}

test('rejects non-POST methods', async () => {
  const { req, res } = mockReqRes({ method: 'GET' })
  await handler(req, res)
  assert.equal(res.statusCode, 405)
})

test('returns 503 when GROQ_API_KEY is not set', async (t) => {
  const original = process.env.GROQ_API_KEY
  delete process.env.GROQ_API_KEY
  t.after(() => { if (original) process.env.GROQ_API_KEY = original })

  const { req, res } = mockReqRes({ body: { system: 'sys', message: 'hi' } })
  await handler(req, res)
  assert.equal(res.statusCode, 503)
})

test('rejects invalid body (missing message)', async (t) => {
  t.before(() => { process.env.GROQ_API_KEY = 'test-key' })
  const { req, res } = mockReqRes({ body: { system: 'sys' } })
  await handler(req, res)
  assert.equal(res.statusCode, 400)
})

test('calls Groq chat completions endpoint and returns text', async (t) => {
  process.env.GROQ_API_KEY = 'test-key'
  const originalFetch = global.fetch
  let capturedUrl, capturedBody
  global.fetch = async (url, opts) => {
    capturedUrl  = url
    capturedBody = JSON.parse(opts.body)
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'hello from groq' } }] }),
    }
  }
  t.after(() => { global.fetch = originalFetch })

  const { req, res } = mockReqRes({ body: { system: 'You are helpful', message: 'hi' } })
  await handler(req, res)

  assert.equal(res.statusCode, 200)
  assert.equal(res._json.text, 'hello from groq')
  assert.equal(capturedUrl, 'https://api.groq.com/openai/v1/chat/completions')
  assert.equal(capturedBody.messages[0], { role: 'system', content: 'You are helpful' }.role && capturedBody.messages[0].role, 'system')
  assert.equal(capturedBody.messages[1].role, 'user')
  assert.equal(capturedBody.messages[1].content, 'hi')
})

test('returns 502 when upstream errors', async (t) => {
  process.env.GROQ_API_KEY = 'test-key'
  const originalFetch = global.fetch
  global.fetch = async () => ({ ok: false, status: 500 })
  t.after(() => { global.fetch = originalFetch })

  const { req, res } = mockReqRes({ body: { system: 'sys', message: 'hi' } })
  await handler(req, res)
  assert.equal(res.statusCode, 502)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test api/ai.test.js`
Expected: FAIL — `api/ai.js` still targets Anthropic, so the Groq-URL assertion and `GROQ_API_KEY` checks fail (and `api/ai.js` uses `export default async function handler`, confirm the import works — if it errors on `.env`-var check because the key var name doesn't match yet, that's the expected failure for this step).

- [ ] **Step 3: Rewrite `api/ai.js` to call Groq**

```js
// api/ai.js
// API: /api/ai
// Purpose: Server-side proxy for Groq API calls (OpenAI-compatible chat
//          completions). The API key lives only in the GROQ_API_KEY env var
//          on Vercel — never in the client bundle. Validates input, pins
//          model + token limits server-side, and applies a best-effort
//          per-IP rate limit tuned to Groq's free tier.

const MODEL      = 'llama-3.3-70b-versatile'
const MAX_TOKENS = 1000

// Best-effort in-memory rate limit (per warm serverless instance):
// Groq free tier is generous (per-minute limits, not 5-min windows like the
// old Anthropic tier) — keep a 1-minute window, 30 requests/IP.
const WINDOW_MS = 60 * 1000
const LIMIT     = 30
const hits      = new Map()

function rateLimited(ip) {
  const now  = Date.now()
  const past = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS)
  if (past.length >= LIMIT) { hits.set(ip, past); return true }
  past.push(now)
  hits.set(ip, past)
  return false
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.GROQ_API_KEY
  if (!key) {
    return res.status(503).json({ error: 'AI is not configured on this deployment' })
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many AI requests — try again in a minute' })
  }

  const { system, message } = req.body || {}
  if (typeof system !== 'string' || typeof message !== 'string' ||
      !system.trim() || !message.trim() ||
      system.length > 8000 || message.length > 24000) {
    return res.status(400).json({ error: 'Invalid request' })
  }

  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: system },
          { role: 'user',   content: message },
        ],
      }),
    })

    if (!upstream.ok) {
      return res.status(502).json({ error: `AI service error (${upstream.status})` })
    }

    const data = await upstream.json()
    const text = data.choices?.[0]?.message?.content || ''
    return res.status(200).json({ text })
  } catch {
    return res.status(502).json({ error: 'AI service unreachable' })
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test api/ai.test.js`
Expected: all 5 tests PASS.

- [ ] **Step 5: Update `README.md` env var docs**

In `README.md`, find the `ANTHROPIC_API_KEY` row in the environment variables table and the "Configure environment" section. Replace:

```markdown
| `ANTHROPIC_API_KEY` | For AI features | **Server-side only** — set in Vercel project env. Powers all AI features via the `/api/ai` proxy. Never prefix with `VITE_`. |
```

with:

```markdown
| `GROQ_API_KEY` | For AI features | **Server-side only** — set in Vercel project env. Powers all AI features via the `/api/ai` proxy (Groq free tier). Never prefix with `VITE_`. |
```

- [ ] **Step 6: Verify full build still succeeds**

Run: `npm run build`
Expected: `✓ built`, no errors (this file isn't part of the Vite client bundle, but confirms nothing else references the old constant/behavior in a way that breaks the build).

- [ ] **Step 7: Mark done (no commit)**

---

## Task 2: Universal natural-language capture — classifier service

**Files:**
- Create: `src/services/captureClassifier.js`
- Create: `src/services/captureClassifier.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/services/captureClassifier.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyCapture } from './captureClassifier.js'

test('falls back to task classification when AI call throws', async () => {
  const failingCaller = async () => { throw new Error('network down') }
  const result = await classifyCapture('call dentist tomorrow high priority', failingCaller)
  assert.equal(result.type, 'task')
  assert.equal(result.fields.priority, 'high')
  assert.ok(result.usedFallback)
})

test('parses a well-formed AI JSON response', async () => {
  const fakeCaller = async () => JSON.stringify({
    type: 'habit',
    fields: { name: 'Drink water', frequency: 'daily' },
  })
  const result = await classifyCapture('drink more water every day', fakeCaller)
  assert.equal(result.type, 'habit')
  assert.deepEqual(result.fields, { name: 'Drink water', frequency: 'daily' })
  assert.equal(result.usedFallback, false)
})

test('falls back to task classification when AI returns unparseable text', async () => {
  const fakeCaller = async () => 'not json at all'
  const result = await classifyCapture('finish the report friday', fakeCaller)
  assert.equal(result.type, 'task')
  assert.ok(result.usedFallback)
})

test('falls back when AI returns an unrecognized type', async () => {
  const fakeCaller = async () => JSON.stringify({ type: 'unknown-thing', fields: {} })
  const result = await classifyCapture('something weird', fakeCaller)
  assert.equal(result.type, 'task')
  assert.ok(result.usedFallback)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test src/services/captureClassifier.test.js`
Expected: FAIL with "Cannot find module './captureClassifier.js'" (file doesn't exist yet).

- [ ] **Step 3: Implement `captureClassifier.js`**

```js
// src/services/captureClassifier.js
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

  if (!parsed || !VALID_TYPES.includes(parsed.type) || typeof parsed.fields !== 'object') {
    return localFallback(text)
  }

  return { type: parsed.type, fields: parsed.fields, usedFallback: false }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test src/services/captureClassifier.test.js`
Expected: all 4 tests PASS.

- [ ] **Step 5: Mark done (no commit)**

---

## Task 3: Wire universal capture into QuickCapture and QuickTaskBar

**Files:**
- Modify: `src/components/quickcapture/QuickCapture.jsx`
- Modify: `src/components/tasks/QuickTaskBar.jsx`

- [ ] **Step 1: Read current submit handlers**

Run: `grep -n "onSubmit\|handleSubmit\|parseNLTask\|const \[.*text" src/components/quickcapture/QuickCapture.jsx src/components/tasks/QuickTaskBar.jsx`

Confirms the exact state variable holding the typed text and the existing submit function name in each file, so the classifier call is inserted at the right point without duplicating logic.

- [ ] **Step 2: Route `QuickCapture.jsx` submission through the classifier**

Import `classifyCapture` and the props this component already receives for creating each item type (it likely already receives `tasks`/`onAddTask`-style props from its parent — confirm via the same grep from Step 1; if it currently only creates tasks, add optional `onAddHabit`/`onAddRoutine`/`onAddEvent` callback props, defaulting to `undefined`, and only route to them if the parent actually passed one — otherwise always create a task, same as today, for types the parent doesn't support yet):

```jsx
import { classifyCapture } from '../../services/captureClassifier'
// ...
const handleSubmit = async (text) => {
  const result = await classifyCapture(text)
  if (result.type === 'task' || !onAddHabit) {
    // existing task-creation call, now fed by result.fields instead of parseNLTask(text) directly
    onAddTask(result.fields)
  } else if (result.type === 'habit' && onAddHabit) {
    onAddHabit(result.fields)
  } else {
    // routine/event not wired to a create-flow from this entry point yet — fall back to task
    onAddTask({ title: text })
  }
}
```

Replace the existing synchronous `parseNLTask(text)` call site with a call to this new async `handleSubmit`, keeping the existing input-clearing/close-modal behavior after it resolves.

- [ ] **Step 3: Apply the same routing to `QuickTaskBar.jsx`**

`QuickTaskBar.jsx` is task-only per its name and current usage in `TasksView.jsx` — route it through `classifyCapture` but only ever act on `result.fields` as task fields (ignore `result.type` here; this bar's job is always "make a task", the classifier's field extraction is what's valuable even if `type` comes back as something else — use `result.fields.title ? result.fields : { title: text }` as a safe fallback if fields don't look task-shaped).

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Visual check**

`npm run dev`. Without a `GROQ_API_KEY` configured locally (demo mode), type a capture like "call dentist tomorrow high priority" into QuickCapture and QuickTaskBar — confirm both still create a correctly-parsed task (this exercises the fallback path, since `/api/ai` returns 503 without a key). If you have a Groq key available to set via `vercel dev` locally, optionally verify a habit-shaped capture ("drink more water daily") routes to habit creation when `onAddHabit` is wired.

- [ ] **Step 6: Mark done (no commit)**

---

## Task 4: Smart scheduling — AI suggestion path

**Files:**
- Modify: `src/hooks/useSmartScheduler.js`
- Modify: `src/components/tasks/SmartSchedulerPanel.jsx`

- [ ] **Step 1: Read the existing heuristic `analysis` shape**

Run: `grep -n "return {" src/hooks/useSmartScheduler.js` and read the surrounding lines — confirms exactly what `analysis` currently contains (e.g. `overdue`, `unscheduled`, `lightDays`, `heavyDays`) so the AI suggestion path is additive to this object, not a replacement.

- [ ] **Step 2: Add an AI-suggestion fetcher to `useSmartScheduler.js`**

Add a new exported function alongside the existing hook (not inside the `useMemo` — this is an on-demand async action, not a derived value):

```js
// Added to src/hooks/useSmartScheduler.js
import { callClaude } from '../services/aiService'

const SCHEDULE_SYSTEM_PROMPT = `You suggest which day (YYYY-MM-DD, within the next 7 days) an overdue or
unscheduled task should be rescheduled to, given the user's upcoming task load per day and optional energy
context. Respond with ONLY a JSON array, no prose: [{"taskId": "...", "suggestedDate": "YYYY-MM-DD", "reason": "short human-readable reason"}].`

export async function getAIScheduleSuggestions(tasksToSchedule, next7Days, todayEnergy) {
  const context = JSON.stringify({
    tasks: tasksToSchedule.map(t => ({ id: t.id, title: t.title, priority: t.priority, estimateMins: t.estimateMins })),
    upcomingLoad: next7Days.map(d => ({ date: d.dateKey, totalMins: d.totalMins, isHeavy: d.isHeavy, isLight: d.isLight })),
    todayEnergy: todayEnergy || null,
  })
  try {
    const raw = await callClaude(SCHEDULE_SYSTEM_PROMPT, context)
    const parsed = JSON.parse(raw.trim())
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
```

- [ ] **Step 3: Wire an accept/dismiss suggestion list into `SmartSchedulerPanel.jsx`**

Read the existing panel's current suggestion-rendering block (it already shows heuristic suggestions per the spec's note that this panel "already exists as a base"). Add local state for AI suggestions and a button to fetch them on demand (don't auto-fetch on every render — this hits the AI proxy):

```jsx
import { getAIScheduleSuggestions } from '../../hooks/useSmartScheduler'
import { useState } from 'react'
// ...
const [aiSuggestions, setAiSuggestions] = useState([])
const [loadingAI, setLoadingAI] = useState(false)

const fetchAISuggestions = async () => {
  setLoadingAI(true)
  const targets = [...analysis.overdue, ...analysis.unscheduled]
  const suggestions = await getAIScheduleSuggestions(targets, analysis.next7 /* or the actual field name confirmed in Step 1 */, analysis.todayEnergy)
  setAiSuggestions(suggestions)
  setLoadingAI(false)
}

const acceptSuggestion = (s) => {
  tasks.updateTask(s.taskId, { date: s.suggestedDate })
  setAiSuggestions(prev => prev.filter(x => x.taskId !== s.taskId))
}
const dismissSuggestion = (s) => setAiSuggestions(prev => prev.filter(x => x.taskId !== s.taskId))
```

Render a button ("✨ Get AI suggestions", disabled while `loadingAI`) and, when `aiSuggestions.length > 0`, a list of suggestion rows each with the task title, suggested date, reason, and Accept/Dismiss buttons calling the handlers above — add this below the panel's existing heuristic suggestion content, don't replace it.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Visual check**

`npm run dev` — Tasks tab, Smart Scheduler panel. Without a configured AI key: click "✨ Get AI suggestions", confirm it fails gracefully (empty list, no crash, `loadingAI` resets to false). With a key configured (optional, via `vercel dev`): confirm suggestions appear, Accept moves the task's date and removes it from the list, Dismiss just removes it from the list without changing the task.

- [ ] **Step 6: Mark done (no commit)**

---

## Task 5: AI-generated routines/plans

**Files:**
- Create: `src/services/routinePlanService.js`
- Modify: `src/components/routines/RoutineEditor.jsx`
- Modify: `src/components/goals/AddGoalModal.jsx`

- [ ] **Step 1: Create the shared draft-generation service**

```js
// src/services/routinePlanService.js
// Purpose: AI-drafted routine steps or goal milestones from a plain-text
//          description. Draft is always returned for user review — never
//          auto-saved by this module.
import { callClaude } from './aiService'

const ROUTINE_SYSTEM_PROMPT = `Given a one-sentence goal, draft a short routine as a JSON array of steps, no prose:
[{"text": "step description", "duration": minutes_as_number_or_null}]. Keep it to 3-6 steps.`

const GOAL_SYSTEM_PROMPT = `Given a one-sentence goal, draft milestones as a JSON array, no prose:
[{"title": "milestone title", "description": "one short sentence"}]. Keep it to 3-5 milestones.`

export async function draftRoutine(goalText) {
  try {
    const raw = await callClaude(ROUTINE_SYSTEM_PROMPT, goalText)
    const parsed = JSON.parse(raw.trim())
    return Array.isArray(parsed) ? parsed.map((s, i) => ({ id: `draft-${i}`, text: s.text, duration: s.duration ?? null })) : []
  } catch {
    return []
  }
}

export async function draftGoalMilestones(goalText) {
  try {
    const raw = await callClaude(GOAL_SYSTEM_PROMPT, goalText)
    const parsed = JSON.parse(raw.trim())
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
```

- [ ] **Step 2: Add a "✨ Draft with AI" entry point to `RoutineEditor.jsx`**

Read the existing empty/new-routine state (how `steps` starts empty for a brand-new routine). Add a text input + button shown only when `steps.length === 0`:

```jsx
import { draftRoutine } from '../../services/routinePlanService'
import { useState } from 'react'
// ...
const [goalText, setGoalText] = useState('')
const [drafting, setDrafting] = useState(false)

const handleDraft = async () => {
  if (!goalText.trim()) return
  setDrafting(true)
  const drafted = await draftRoutine(goalText.trim())
  if (drafted.length > 0) setSteps(drafted) // uses the existing steps-setter from Task 10 of the rebrand plan / this file's existing state
  setDrafting(false)
}
// ...in the render, only when steps.length === 0, above the (now-empty) StepBuilderCard list:
<div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: 'var(--accent-light)' }}>
  <input value={goalText} onChange={e => setGoalText(e.target.value)}
    placeholder="Describe the routine, e.g. 'morning routine for deep work'"
    className="w-full bg-transparent text-sm outline-none" style={{ color: 'var(--text)' }} />
  <button onClick={handleDraft} disabled={drafting || !goalText.trim()}
    className="text-sm font-medium disabled:opacity-40" style={{ color: 'var(--accent)' }}>
    {drafting ? 'Drafting…' : '✨ Draft with AI'}
  </button>
</div>
```

The drafted steps land in the same editable `steps` state the manual `StepBuilderCard` list already edits (from the rebrand plan's Task 10) — user can edit/reorder/remove before saving, same as manually-entered steps. Nothing saves until the existing Save action is used.

- [ ] **Step 3: Add the same entry point to `AddGoalModal.jsx`**

Read the existing milestone-list state in this file. Add the equivalent input+button (only when milestones list is empty), calling `draftGoalMilestones` and setting the existing milestones state with the result — same review-before-save pattern as Step 2.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Visual check**

`npm run dev`. New Routine (empty state): type a goal, click "✨ Draft with AI" — without a key configured, confirm it fails gracefully (button re-enables, no steps added, no crash); with a key configured, confirm drafted steps appear as editable `StepBuilderCard`s and Save still works. Repeat for New Goal's milestone breakdown.

- [ ] **Step 6: Mark done (no commit)**

---

## Task 6: Final cross-cutting verification

**Files:** none (verification only)

- [ ] **Step 1: Run all new unit tests together**

Run: `node --test api/ai.test.js src/services/captureClassifier.test.js`
Expected: all tests PASS (9 total across both files).

- [ ] **Step 2: Full production build**

Run: `npm run build`
Expected: `✓ built`, zero errors.

- [ ] **Step 3: Confirm no leftover Anthropic references**

Run: `grep -rn "anthropic\|ANTHROPIC_API_KEY\|claude-sonnet-4" api src README.md --include="*.js" --include="*.md" -i`
Expected: zero matches (everything now references Groq/`GROQ_API_KEY`).

- [ ] **Step 4: Manual smoke pass in demo mode (no AI key)**

`npm run dev` — confirm every new AI entry point (QuickCapture, QuickTaskBar, Smart Scheduler AI suggestions, Routine/Goal AI draft) degrades gracefully with no `GROQ_API_KEY` set: no crashes, no stuck loading states, existing manual flows still work exactly as before this plan started.

- [ ] **Step 5: Mark plan complete (no commit — user commits manually)**
