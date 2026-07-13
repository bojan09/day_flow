# Task Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved spec (`docs/superpowers/specs/2026-07-13-task-reminders-design.md`) — let a user set a reminder time on any task (including recurring ones) and receive a real push notification even with the app closed, that opens straight to that task.

**Architecture:** Client computes an absolute `reminderAt` UTC timestamp from `date` + `reminderTime` (local timezone) whenever either changes; a new Supabase edge function polls every minute for due, unsent reminders and reuses the existing `send-push` function; `DashboardPage` opens the target task when the notification is tapped.

**Tech Stack:** React 18, Supabase (Postgres + Edge Functions/Deno), existing VAPID push infra.

**Testing approach:** No component-test framework in this repo (established in earlier phases of this project). `mappers.js`/`recurringEngine.js`/edge-function logic are plain functions — those get `node:test` unit tests. UI wiring verified via `npm run build` + manual reasoning (no browser available in this environment).

**No git commits.** User manages all commits manually — skip any commit step, just mark the checkbox done after verifying.

---

## File Structure

New files:
- `supabase/migration-task-reminders.sql` — adds `reminder_time`, `reminder_at`, `reminder_sent` columns + partial index
- `supabase/functions/check-reminders/index.ts` — cron-triggered edge function, fires due reminders
- `src/utils/reminders.js` — pure helper: `computeReminderAt(date, reminderTime)` → ISO string or null (extracted so it's unit-testable and reusable from both `useTasks.js` and `recurringEngine.js`)
- `src/utils/reminders.test.js` — unit tests for `computeReminderAt`

Modified files:
- `src/hooks/useTasks.js` — add `reminderTime`/`reminderAt`/`reminderSent` fields to `addTask`/`updateTask`, call `computeReminderAt` when `date`/`reminderTime` change
- `src/services/mappers.js` — add the 3 fields to `taskMapper.toDB`/`fromDB`
- `src/services/recurringEngine.js` — copy `reminderTime` onto spawned instances, compute their `reminderAt`
- `src/components/tasks/TaskModalDesktop.jsx` / `TaskModalMobile.jsx` (metadata rail / Details tab, via `TaskDetail.jsx`) — new "Remind me at" time input
- `src/pages/DashboardPage.jsx` — read `?openTask=` query param, open `TaskDetail`

Deleted files:
- `src/services/notificationService.js` — superseded by push, and every import site

---

## Task 1: `computeReminderAt` helper + unit tests

**Files:**
- Create: `src/utils/reminders.js`
- Create: `src/utils/reminders.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/utils/reminders.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeReminderAt } from './reminders.js'

test('returns null when reminderTime is empty/null', () => {
  assert.equal(computeReminderAt('2026-07-20', ''), null)
  assert.equal(computeReminderAt('2026-07-20', null), null)
  assert.equal(computeReminderAt('2026-07-20', undefined), null)
})

test('returns null when date is empty/null', () => {
  assert.equal(computeReminderAt('', '09:00'), null)
  assert.equal(computeReminderAt(null, '09:00'), null)
})

test('combines date + time into a valid ISO timestamp', () => {
  const result = computeReminderAt('2026-07-20', '09:30')
  assert.ok(result, 'should return a non-null value')
  const d = new Date(result)
  assert.equal(d.getFullYear(), 2026)
  assert.equal(d.getMonth(), 6) // July = month index 6
  assert.equal(d.getDate(), 20)
  assert.equal(d.getHours(), 9)
  assert.equal(d.getMinutes(), 30)
})

test('output is a valid ISO 8601 string parseable by Date', () => {
  const result = computeReminderAt('2026-01-05', '23:45')
  assert.doesNotThrow(() => new Date(result).toISOString())
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test src/utils/reminders.test.js`
Expected: FAIL with "Cannot find module './reminders.js'".

- [ ] **Step 3: Implement `reminders.js`**

```js
// src/utils/reminders.js
// Purpose: Combine a task's date (YYYY-MM-DD) and reminderTime (HH:MM, local
//          time) into an absolute timestamp for the reminder-cron to compare
//          against `now()`. Returns null when either input is missing —
//          a task with no reminder set has no reminderAt.
export function computeReminderAt(date, reminderTime) {
  if (!date || !reminderTime) return null
  const [hours, minutes] = reminderTime.split(':').map(Number)
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(year, month - 1, day, hours, minutes, 0, 0)
  return d.toISOString()
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test src/utils/reminders.test.js`
Expected: all 4 tests PASS.

- [ ] **Step 5: Mark done (no commit)**

---

## Task 2: Supabase migration — reminder columns

**Files:**
- Create: `supabase/migration-task-reminders.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- Migration: task reminders
-- Adds per-task reminder scheduling columns. Run in Supabase SQL editor.
-- reminder_at is the field the check-reminders cron function actually queries —
-- it's a precomputed absolute UTC timestamp (derived client-side from the
-- task's date + reminder_time in the user's local timezone), so no server-side
-- timezone math is needed.

alter table public.tasks
  add column if not exists reminder_time text,
  add column if not exists reminder_at timestamptz,
  add column if not exists reminder_sent boolean not null default false;

create index if not exists tasks_pending_reminders
  on public.tasks (reminder_at)
  where reminder_sent = false and completed = false;
```

- [ ] **Step 2: Note for the user (not an automated step)**

This SQL file must be run manually in the Supabase SQL editor by the user — same pattern as the existing `supabase/migration-recurrence-controls.sql`. Do not attempt to run it automatically; there's no Supabase CLI/DB connection available in this environment. Mark this step done once the file exists and is syntactically valid SQL (read it back and sanity-check the syntax).

- [ ] **Step 3: Mark done (no commit)**

---

## Task 3: `mappers.js` — reminder field mapping

**Files:**
- Modify: `src/services/mappers.js`

- [ ] **Step 1: Read the current `taskMapper` fully**

Read `src/services/mappers.js` in full — confirm both `toDB` and `fromDB` (or however the reverse direction is named/structured; the earlier read only showed `toDB`) exist and follow the same explicit-field-list pattern, not the generic `convertKeys` auto-converter (the file has both a generic converter and an explicit `taskMapper` — confirm which one `useTasks.js` actually calls before editing).

- [ ] **Step 2: Add the 3 reminder fields to both directions**

In `taskMapper.toDB`, add after the `notes` line:
```js
    reminder_time:  task.reminderTime  ?? null,
    reminder_at:    task.reminderAt    ?? null,
    reminder_sent:  task.reminderSent  ?? false,
```

In the reverse direction (`fromDB` or equivalent — use the real function/property name found in Step 1), add the matching camelCase fields:
```js
    reminderTime:  row.reminder_time  ?? null,
    reminderAt:    row.reminder_at    ?? null,
    reminderSent:  row.reminder_sent  ?? false,
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 4: Mark done (no commit)**

---

## Task 4: `useTasks.js` — reminder fields on create/update

**Files:**
- Modify: `src/hooks/useTasks.js`

- [ ] **Step 1: Import the helper and add fields to `addTask`**

```js
import { computeReminderAt } from '../utils/reminders'
```

In `addTask`, inside the `t` object construction (after `notes: task.notes || ''`), add:
```js
      reminderTime: task.reminderTime || '',
      reminderAt:   computeReminderAt(task.date || getTodayKey(), task.reminderTime),
      reminderSent: false,
```

- [ ] **Step 2: Recompute `reminderAt` in `updateTask` when `date`/`reminderTime` changes**

`updateTask` currently does `const updated = { ...t, ...updates }`. Change this to also recompute `reminderAt` whenever the merged result has a `date`/`reminderTime`, and reset `reminderSent` to `false` if the reminder time actually changed (a rescheduled reminder should fire again):

```js
  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const merged = { ...t, ...updates }
      const newReminderAt = computeReminderAt(merged.date, merged.reminderTime)
      const reminderChanged = newReminderAt !== t.reminderAt
      const updated = {
        ...merged,
        reminderAt: newReminderAt,
        reminderSent: reminderChanged ? false : merged.reminderSent,
      }
      persist(updated)
      return updated
    }))
  }
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 4: Mark done (no commit)**

---

## Task 5: `recurringEngine.js` — carry reminder onto spawned instances

**Files:**
- Modify: `src/services/recurringEngine.js`

- [ ] **Step 1: Read the file fully**

Read `src/services/recurringEngine.js` in full — confirm the exact shape of the object passed to `addTask({...})` inside `spawnRecurringTasks` (found earlier at line ~29) so the added fields land in the right place without guessing.

- [ ] **Step 2: Copy `reminderTime` from the template onto the spawned instance**

In the `addTask({...})` call inside `spawnRecurringTasks`, add:
```js
        reminderTime: template.reminderTime || '',
```
`addTask` (from Task 4 above) already computes `reminderAt` from whatever `date`/`reminderTime` it receives, so no separate computation is needed here — just pass `reminderTime` through and `addTask` handles the rest.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 4: Mark done (no commit)**

---

## Task 6: "Remind me at" UI in the task modal

**Files:**
- Modify: `src/components/tasks/TaskDetail.jsx`

- [ ] **Step 1: Read the current file**

Read `src/components/tasks/TaskDetail.jsx` in full (it was restructured in an earlier phase of this project into `mainFields`/`metaFields`/`subtaskFields` groups rendered via `TaskModalDesktop`/`TaskModalMobile`). Confirm the existing `date` state/input (around where `type="date"` appears) so the new reminder input sits next to it in `metaFields`, matching existing styling conventions in that block.

- [ ] **Step 2: Add reminder state and input**

Add local state near the existing `date` state:
```jsx
const [reminderTime, setReminderTime] = useState(task?.reminderTime || '')
```

In `metaFields`, immediately after the existing date `<input type="date">` block, add:
```jsx
<div>
  <label htmlFor="task-reminder-time" className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>
    Remind me at
  </label>
  <input
    id="task-reminder-time"
    type="time"
    value={reminderTime}
    onChange={e => setReminderTime(e.target.value)}
    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text)' }}
  />
</div>
```

- [ ] **Step 3: Include `reminderTime` in the save/update call**

Find the existing save handler (e.g. `saveAll`/`handleSubmit`, whatever calls `tasks.updateTask(task.id, {...})`) and add `reminderTime` to the updates object it constructs — same pattern as the existing `date`/`priority`/`category` fields already passed there.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Mark done (no commit)**

---

## Task 7: `check-reminders` edge function

**Files:**
- Create: `supabase/functions/check-reminders/index.ts`

- [ ] **Step 1: Write the function**

```ts
// Edge Function: check-reminders
// Purpose: Cron-triggered (every 1 minute) — finds tasks whose reminder time
// has arrived and haven't been notified yet, sends a push per task via the
// existing send-push function, and marks them sent (idempotency guard).
// Schedule with: Supabase Dashboard → Database → Cron Jobs
// Cron expression: * * * * *  (every minute)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const nowIso = new Date().toISOString()

  const { data: dueTasks, error } = await supabase
    .from('tasks')
    .select('id, user_id, title, category')
    .lte('reminder_at', nowIso)
    .eq('reminder_sent', false)
    .eq('completed', false)
    .limit(500)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!dueTasks || dueTasks.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
  }

  let sent = 0

  for (const task of dueTasks) {
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          userId: task.user_id,
          title:  `⏰ ${task.title}`,
          body:   task.category || 'DayFlow reminder',
          url:    `/dashboard?openTask=${task.id}`,
        }),
      })
      sent++
    } catch (e) {
      console.error(`Failed to send reminder for task ${task.id}:`, e)
    }

    // Mark sent regardless of push success — a permanently-undeliverable
    // reminder (e.g. all subscriptions expired) should not retry every minute.
    await supabase
      .from('tasks')
      .update({ reminder_sent: true })
      .eq('id', task.id)
  }

  return new Response(JSON.stringify({ sent, checked: dueTasks.length }), { status: 200 })
})
```

- [ ] **Step 2: Sanity-check the file**

Read it back, confirm it mirrors the existing `supabase/functions/daily-reminders/index.ts`'s auth/client-creation pattern exactly (same `CRON_SECRET` check, same `createClient` call shape) so it's consistent with the already-deployed sibling function.

- [ ] **Step 3: Note for the user (not an automated step)**

This function must be deployed (`supabase functions deploy check-reminders`) and scheduled via the Supabase Dashboard Cron Jobs UI at a 1-minute interval — same manual step the existing `daily-reminders` function already requires per its own header comment. Cannot be done from this environment (no Supabase CLI session/deploy credentials available here).

- [ ] **Step 4: Mark done (no commit)**

---

## Task 8: `DashboardPage.jsx` — open task from notification tap

**Files:**
- Modify: `src/pages/DashboardPage.jsx`

- [ ] **Step 1: Read the current file**

Read `src/pages/DashboardPage.jsx` in full — confirm how `activeTab`/tab-switching state works and how `TasksView`/`TaskDetail` currently get mounted, so the `openTask` deep-link opens the right task without duplicating the modal-open logic that already exists inside `TasksView.jsx`.

- [ ] **Step 2: Add query-param handling on mount**

Near the top of the component, add (using `react-router-dom`'s `useSearchParams`, already a dependency per `package.json`):
```jsx
import { useSearchParams } from 'react-router-dom'
// ...
const [searchParams, setSearchParams] = useSearchParams()
const openTaskId = searchParams.get('openTask')

useEffect(() => {
  if (openTaskId) {
    setActiveTab('tasks') // use the real tab-state setter name found in Step 1
    // Clear the param so it doesn't re-trigger on next render/refresh
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.delete('openTask')
      return next
    }, { replace: true })
  }
}, [openTaskId])
```

- [ ] **Step 3: Pass the task id down to `TasksView` to auto-open detail**

`TasksView.jsx` already has `setDetail`/`detailTask` state for opening `TaskDetail` (from the earlier rebrand work). Add an `openTaskId` prop to `TasksView` and, in a `useEffect` inside `TasksView.jsx`, call `setDetail(tasks.tasks.find(t => t.id === openTaskId))` when `openTaskId` is present and matches a task:

```jsx
// In TasksView.jsx, near existing useState calls:
useEffect(() => {
  if (openTaskId) {
    const match = tasks.tasks.find(t => t.id === openTaskId)
    if (match) setDetail(match)
  }
}, [openTaskId, tasks.tasks])
```

Wire `<TasksView openTaskId={openTaskId} ... />` from `DashboardPage.jsx`.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Mark done (no commit)**

---

## Task 9: Delete the superseded local `notificationService.js`

**Files:**
- Delete: `src/services/notificationService.js`

- [ ] **Step 1: Find every reference**

Run: `grep -rn "notificationService" src --include="*.js" --include="*.jsx"`

- [ ] **Step 2: Remove each import and its usage**

For each file found: delete the import line and any call sites (e.g. `notificationService.scheduleTaskReminder(...)`, permission-request UI that isn't already covered by `PushSetupPanel.jsx`). If a component used this service for something push doesn't cover (e.g. a generic "ask for notification permission" prompt unrelated to task reminders specifically), evaluate whether that's still needed — if `PushSetupPanel.jsx` already requests permission as part of its subscribe flow, the standalone permission-request usage is now redundant and should be removed too; if it serves a genuinely different purpose, leave that specific call site and note it in your report instead of deleting blindly.

- [ ] **Step 3: Delete the file**

```bash
rm src/services/notificationService.js
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no "Could not resolve" errors.

- [ ] **Step 5: Mark done (no commit)**

---

## Task 10: Final cross-cutting verification

**Files:** none (verification only)

- [ ] **Step 1: Run all new unit tests**

Run: `node --test src/utils/reminders.test.js`
Expected: 4/4 pass.

- [ ] **Step 2: Full production build**

Run: `npm run build`
Expected: `✓ built`, zero errors.

- [ ] **Step 3: Confirm no leftover notificationService references**

Run: `grep -rn "notificationService" src`
Expected: zero matches.

- [ ] **Step 4: Confirm reminder fields round-trip**

Run: `grep -n "reminder" src/services/mappers.js src/hooks/useTasks.js src/services/recurringEngine.js`
Expected: matches in all three files, confirming the field flows from creation → mapping → recurrence consistently.

- [ ] **Step 5: Mark plan complete (no commit — user commits manually)**
