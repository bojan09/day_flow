# DayFlow V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Safely evolve the existing DayFlow application into an action-first, locally resilient PWA with deterministic next-action guidance, persistent focus, fast capture and recovery flows, and OneSignal-only contextual notifications.

**Architecture:** Preserve the current React/Vite feature hooks and Supabase tables, but introduce pure domain modules for storage identity, ranking, focus timing, capture parsing, recovery decisions, deep links, and notification policy. Complete user-data isolation before product features, then connect the action loop through existing hooks and dashboard navigation. OneSignal runs beside the root PWA worker at a separate service-worker scope; Supabase migrations and one scheduled Edge Function provide user preferences, delivery history, and server-only messaging.

**Tech Stack:** React 18, Vite, Tailwind CSS, React Router 6, Node's built-in test runner, ESLint, Supabase Auth/Postgres/Realtime/Edge Functions/Cron, OneSignal Web SDK v16.

## Global Constraints

- Work only on branch `dayflow_v2`; never merge into `master`.
- Preserve DayFlow's visual identity and every existing module.
- OneSignal is the only remote push transport; do not retain native VAPID delivery as a fallback.
- Never commit secret values or expose the OneSignal REST API key to client code.
- New database objects must use RLS with `USING` and `WITH CHECK` ownership policies.
- Do not delete production data or weaken existing RLS.
- Quick Capture must save without an AI or network dependency.
- Daily priorities must reference existing tasks rather than duplicate them.
- All behavior changes follow a red-green-refactor test cycle.
- Live OneSignal delivery and deployed PWA validation remain explicitly unverified until the user supplies/configures external services.

---

## File structure map

### New domain modules

- `src/services/scopedStorage.js` — versioned demo/user/device storage keys and legacy migration reads.
- `src/services/syncResult.js` — distinguishes successful empty reads from failed remote reads.
- `src/services/offlineOperations.js` — serializable, owner-scoped operation registry and replay reducer.
- `src/services/nextAction.js` — deterministic task scoring and explanation.
- `src/services/focusSession.js` — timestamp-based focus state machine.
- `src/services/captureParser.js` — synchronous capture type/date/time/duration parser.
- `src/services/captureInbox.js` — conversion normalization and duplicate-conversion guards.
- `src/services/recovery.js` — overdue-reset thresholds and review queue construction.
- `src/services/deepLinks.js` — allowlisted external-path to dashboard-state normalization.
- `src/services/notificationPolicy.js` — preferences, quiet hours, throttling, and candidate rules.
- `src/services/oneSignalClient.js` — feature-gated SDK initialization, identity, permission, and subscription state.

### New hooks and components

- `src/hooks/useDailyPriorities.js` — date-scoped references to up to three tasks.
- `src/hooks/useFocusSession.js` — persisted focus session actions and timer refresh.
- `src/hooks/useCaptureInbox.js` — demo/Supabase inbox CRUD and conversions.
- `src/hooks/useNotificationPreferences.js` — notification settings persistence.
- `src/components/today/DailyPriorities.jsx` — Big 3 task-reference UI.
- `src/components/focus/FocusControls.jsx` — explicit duration/state controls.
- `src/components/capture/CaptureInbox.jsx` — organize-later inbox.
- `src/components/notifications/NotificationSettings.jsx` — opt-in, categories, times, timezone, quiet hours.

### Supabase additions

- `supabase/migrations/202608120001_dayflow_v2_core.sql` — task schema reconciliation, capture inbox, notification preferences, deliveries, indexes, and RLS.
- `supabase/migrations/202608120002_notification_cron.sql` — extensions and Vault-based cron invocation.
- `supabase/functions/process-notifications/index.ts` — contextual OneSignal delivery worker.
- `supabase/functions/process-notifications/policy.ts` — pure Deno-compatible notification policy.
- `public/push/onesignal/OneSignalSDKWorker.js` — separately scoped OneSignal worker.

---

### Task 1: Establish repeatable quality gates and safe dependency baseline

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `eslint.config.js`
- Modify: `vite.config.js`
- Modify: `src/components/ui/PageTransition.jsx`

**Interfaces:**
- Produces scripts: `npm run lint`, `npm test`, `npm run test:unit`, `npm run build`.
- Removes the unused `gsap` dependency and `window.gsap` branch.
- Produces a Vite chunk strategy that never returns a named chunk for a module absent from the graph.

- [ ] **Step 1: Capture the current dependency and bundle evidence**

Run:

```powershell
npm.cmd audit --json > $env:TEMP\dayflow-audit-before.json
npm.cmd run build
```

Expected: build succeeds; output contains the existing empty `vendor-supabase` warning and audit metadata reports nine advisories.

- [ ] **Step 2: Add the lint configuration and scripts**

Add ESLint 9 and React hooks/refresh plugins as dev dependencies. Define:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --max-warnings=0",
    "test": "node --test",
    "test:unit": "node --test"
  }
}
```

Configure browser globals for `src`, Node globals for `api/*.test.js` and `src/**/*.test.js`, and Deno globals for `supabase/functions/**/*.ts`. Ignore `dist` and `node_modules`. Enable recommended JavaScript, React hooks, and refresh rules; disable `react-refresh/only-export-components` for hook/context modules already exporting multiple values.

- [ ] **Step 3: Remove the unused animation dependency and brittle chunk rule**

Remove `gsap` from `package.json`. Make `PageTransition` use its existing CSS animation path only and respect a `motion-reduce:animate-none` class. Replace the aggregate `views-core`, `views-secondary`, and `views-tertiary` manual chunk mapping with vendor-only groups for React/router, dates, and Supabase; return `undefined` for application files.

- [ ] **Step 4: Apply compatible security updates**

Run:

```powershell
npm.cmd update
npm.cmd audit fix
```

Do not use `--force`. If Vite remains vulnerable because only a major upgrade fixes it, update Vite and `@vitejs/plugin-react` together, then retain the upgrade only if lint, tests, build, and dev-server smoke checks pass.

- [ ] **Step 5: Verify the quality baseline**

Run:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd audit
```

Expected: lint has zero errors/warnings, 14 existing tests pass, build exits 0 without an empty-chunk warning, and advisories are reduced as far as compatible verified upgrades allow.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json eslint.config.js vite.config.js src/components/ui/PageTransition.jsx
git commit -m "chore: establish DayFlow V2 quality gates"
```

### Task 2: Isolate user data and make remote loads authoritative

**Files:**
- Create: `src/services/scopedStorage.js`
- Create: `src/services/scopedStorage.test.js`
- Create: `src/services/syncResult.js`
- Create: `src/services/syncResult.test.js`
- Modify: `src/services/storage.js`
- Modify: `src/services/supabaseDataService.js`
- Modify: `src/hooks/usePersistedState.js`
- Modify: `src/hooks/useTasks.js`
- Modify: `src/hooks/useNotes.js`
- Modify: `src/hooks/useHabits.js`
- Modify: `src/hooks/useGoals.js`
- Modify: `src/hooks/useIdeas.js`
- Modify: `src/hooks/useProjects.js`
- Modify: `src/hooks/useBookmarks.js`

**Interfaces:**
- Produces `storageScope(userId, configured): "demo" | "user:<uuid>"`.
- Produces `scopedKey(scope, key): "v2:<scope>:<key>"`.
- Produces `remoteSuccess(value)` and `remoteFailure(error)` discriminated results.
- Collection services return `{ ok: true, value } | { ok: false, error }`.

- [ ] **Step 1: Write failing storage-isolation tests**

Create tests using an injected in-memory Storage implementation:

```js
test('keeps two users task caches separate', () => {
  const storage = createScopedStorage(memoryStorage())
  storage.set('user:a', 'tasks', [{ id: 'a1' }])
  storage.set('user:b', 'tasks', [{ id: 'b1' }])
  assert.deepEqual(storage.get('user:a', 'tasks', []), [{ id: 'a1' }])
  assert.deepEqual(storage.get('user:b', 'tasks', []), [{ id: 'b1' }])
})

test('uses device scope only for non-sensitive preferences', () => {
  assert.equal(scopedKey('device', 'pwa_install_dismissed'), 'v2:device:pwa_install_dismissed')
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test src/services/scopedStorage.test.js`

Expected: FAIL because `createScopedStorage`, `storageScope`, and `scopedKey` do not exist.

- [ ] **Step 3: Implement scoped storage**

Implement a factory with `get(scope, key, fallback)`, `set(scope, key, value)`, `remove(scope, key)`, and `readLegacy(key, fallback)`. JSON parse failures return the fallback. Export a browser-backed singleton from `storage.js` while preserving temporary compatibility wrappers only for migration code.

- [ ] **Step 4: Write failing authoritative-empty and failure-preservation tests**

```js
test('successful empty result replaces cached records', () => {
  assert.deepEqual(resolveRemoteValue(['cached'], remoteSuccess([])), { value: [], stale: false })
})

test('failed result preserves same-user cache and marks stale', () => {
  const error = new Error('offline')
  assert.deepEqual(resolveRemoteValue(['cached'], remoteFailure(error)), {
    value: ['cached'], stale: true, error,
  })
})
```

- [ ] **Step 5: Run tests and verify RED**

Run: `node --test src/services/syncResult.test.js`

Expected: FAIL because the sync-result functions do not exist.

- [ ] **Step 6: Implement result contracts and migrate services**

Make every `getAll`/`get` service reject neither success nor empty. Return `remoteFailure(error)` on Supabase errors. Make every mutation throw on Supabase errors. Update hooks to compute their scope from authenticated user identity, reset `synced` on identity change, load only that scope's cache, apply successful empty results, and retain cache only on failure.

- [ ] **Step 7: Verify all scoped data hooks**

Run:

```powershell
node --test src/services/scopedStorage.test.js src/services/syncResult.test.js
npm.cmd run lint
npm.cmd run build
```

Expected: tests pass and every structured hook compiles with the new service contract.

- [ ] **Step 8: Commit**

```powershell
git add src/services src/hooks
git commit -m "fix: isolate user caches and sync results"
```

### Task 3: Make offline replay owner-safe and reload-safe

**Files:**
- Create: `src/services/offlineOperations.js`
- Create: `src/services/offlineOperations.test.js`
- Modify: `src/hooks/useOfflineQueue.js`
- Modify: `src/main.jsx`
- Modify: `src/hooks/useAuth.jsx`
- Modify: `src/services/oneSignalClient.js` only if Task 11 has already created it; otherwise add the sign-out callback interface without importing it.

**Interfaces:**
- Produces `operationKey(type, entityId): string`.
- Produces `partitionReplay(queue, activeOwnerId, handlers)` returning `{ completed, remaining, foreign }`.
- Queue item shape: `{ id, ownerId, type, entityId, payload, queuedAt, attempts }`.
- `useOfflineQueue(activeOwnerId)` exposes `enqueue`, `replay`, `clearOwner`, `queueLength`, and `lastError`.

- [ ] **Step 1: Write failing ownership/reload tests**

```js
test('does not replay another user operation', async () => {
  const calls = []
  const result = await replayOperations([
    { id: '1', ownerId: 'a', type: 'kv:set', entityId: 'prefs', payload: {} },
  ], 'b', { 'kv:set': async op => calls.push(op) })
  assert.equal(calls.length, 0)
  assert.equal(result.remaining.length, 1)
})

test('keeps unknown operation types queued', async () => {
  const result = await replayOperations([
    { id: '1', ownerId: 'a', type: 'unknown', entityId: 'x', payload: {} },
  ], 'a', {})
  assert.equal(result.remaining.length, 1)
  assert.match(result.errors[0].message, /unknown operation/i)
})
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test src/services/offlineOperations.test.js`

Expected: FAIL because `replayOperations` is absent.

- [ ] **Step 3: Implement serializable operations and stable handlers**

Support stable types for `kv:set` first, then structured upsert/delete operations used by modified hooks. Store the queue under `v2:user:<owner>:offline_write_queue`. Never serialize functions. Replayed failures increment attempts and stay queued.

- [ ] **Step 4: Wire authentication ownership**

Pass `user?.id || "demo"` from a small authenticated root wrapper into `useOfflineQueue`. On logout, unsubscribe realtime channels and clear only in-memory state/handlers for the outgoing owner; retain failed queued writes for that same owner to retry after the same account returns.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
node --test src/services/offlineOperations.test.js
npm.cmd test
npm.cmd run lint
npm.cmd run build
git add src/services/offlineOperations.js src/services/offlineOperations.test.js src/hooks/useOfflineQueue.js src/main.jsx src/hooks/useAuth.jsx
git commit -m "fix: scope offline replay to its owner"
```

### Task 4: Reconcile the Supabase schema and add V2 tables safely

**Files:**
- Create: `supabase/migrations/202608120001_dayflow_v2_core.sql`
- Create: `supabase/migrations/202608120001_dayflow_v2_core.test.js`
- Modify: `supabase/schema.sql`
- Modify: `README.md`

**Interfaces:**
- Produces tables `capture_inbox`, `notification_preferences`, and `notification_deliveries`.
- Reconciles task columns `due_time`, `custom_mins`, `reminder_time`, `reminder_at`, `reminder_sent`, `recur_status`, and `recur_end_date` with client mappers.
- Does not drop `push_subscriptions`; marks it deprecated for later operator cleanup.

- [ ] **Step 1: Write failing migration contract tests**

Read SQL as text and assert required safety clauses:

```js
test('all V2 user tables enable RLS and constrain inserts', () => {
  for (const table of ['capture_inbox', 'notification_preferences', 'notification_deliveries']) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, 'i'))
    assert.match(sql, new RegExp(`with check \\(auth\\.uid\\(\\) = user_id\\)`, 'i'))
  }
})

test('migration never drops data-bearing tables', () => {
  assert.doesNotMatch(sql, /drop\s+table/i)
})
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test supabase/migrations/202608120001_dayflow_v2_core.test.js`

Expected: FAIL because the migration is absent.

- [ ] **Step 3: Write the additive migration**

Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`, explicit checks for enum-like text values, timestamps, foreign keys, indexes for pending reminders/inbox status/notification candidate lookups, and idempotent policy recreation through `DROP POLICY IF EXISTS` followed by constrained policies.

`capture_inbox` includes `id uuid default gen_random_uuid()`, `user_id`, `text`, `inferred_type`, `fields jsonb`, `status`, `converted_type`, `converted_id`, `created_at`, and `updated_at`.

`notification_preferences` uses `user_id` as primary key and includes the category booleans, local times, quiet hours, timezone, enabled, last-open/planning timestamps, and audit timestamps.

`notification_deliveries` includes logical key, category, source type/ID, bucket, OneSignal message ID, idempotency UUID, status, last error, attempted/sent timestamps, and a unique `(user_id, logical_key)` constraint.

- [ ] **Step 4: Update canonical schema documentation**

Mirror current task columns and new tables in `schema.sql`. Update README migration order and explain that the old VAPID objects are deprecated but intentionally not dropped automatically.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
node --test supabase/migrations/202608120001_dayflow_v2_core.test.js
git diff --check
git add supabase README.md
git commit -m "feat: add secure DayFlow V2 schema"
```

### Task 5: Build the deterministic next-action engine

**Files:**
- Create: `src/services/nextAction.js`
- Create: `src/services/nextAction.test.js`
- Modify: `src/hooks/useSmartScheduler.js`
- Modify: `src/components/today/PriorityRecommendation.jsx`

**Interfaces:**
- Produces `scoreTask(task, context): { score, reasons } | null`.
- Produces `rankNextActions(tasks, context): RankedTask[]`.
- Produces `getNextAction(tasks, context): RankedTask | null`.
- Context shape: `{ now, dailyPriorityIds, projects }`.

- [ ] **Step 1: Write failing ranking tests**

Cover completed exclusion, pinned focus, Big 3, overdue age cap, due today, priority, scheduled proximity, duration, future penalty, paused recurring templates, invalid dates, and deterministic ties. Include:

```js
test('overdue high priority outranks low priority today when neither is pinned', () => {
  const ranked = rankNextActions([
    task({ id: 'today', date: '2026-08-12', priority: 'low' }),
    task({ id: 'late', date: '2026-08-10', priority: 'high' }),
  ], { now: new Date('2026-08-12T10:00:00'), dailyPriorityIds: [], projects: [] })
  assert.equal(ranked[0].task.id, 'late')
  assert.ok(ranked[0].reasons.some(reason => reason.code === 'overdue'))
})
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test src/services/nextAction.test.js`

Expected: FAIL because the ranking module is absent.

- [ ] **Step 3: Implement the scoring constants and pure ranking**

Export `NEXT_ACTION_WEIGHTS` with the exact approved values. Normalize local dates without UTC conversion. Return reason objects `{ code, label, score }`, sorted by absolute contribution. Resolve ties by scheduled/due timestamp, `createdAt`, then stable string ID.

- [ ] **Step 4: Replace the scheduler precedence chain**

Keep workload analytics and AI scheduling behavior in `useSmartScheduler`, but source `topRecommendation` from `getNextAction`. Pass daily priorities and projects from Today. Update the recommendation card to show the top two reasons, estimate, priority, overdue/due context, and a primary `Start Focus` callback. Always render the clear state when no candidate exists.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
node --test src/services/nextAction.test.js
npm.cmd run lint
npm.cmd run build
git add src/services/nextAction* src/hooks/useSmartScheduler.js src/components/today/PriorityRecommendation.jsx
git commit -m "feat: add deterministic next-action ranking"
```

### Task 6: Add Daily Big 3 and rework Today hierarchy

**Files:**
- Create: `src/hooks/useDailyPriorities.js`
- Create: `src/services/dailyPriorities.js`
- Create: `src/services/dailyPriorities.test.js`
- Create: `src/components/today/DailyPriorities.jsx`
- Modify: `src/components/today/TodayView.jsx`
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/hooks/useWidgetPreferences.js`
- Modify: `src/components/today/GoodMorningHeader.jsx`
- Modify: `src/components/today/ProgressRing.jsx`

**Interfaces:**
- Produces `normalizeDailyPriorities(ids, tasks): string[]` capped at three existing incomplete tasks.
- `useDailyPriorities(tasks)` exposes `{ ids, tasks, add, remove, reorder, clearCompleted }`.
- `TodayView` accepts `dailyPriorities` and `onStartFocus(taskId)`.

- [ ] **Step 1: Write failing priority-reference tests**

```js
test('keeps at most three unique incomplete existing task ids', () => {
  const result = normalizeDailyPriorities(['a', 'a', 'missing', 'b', 'c', 'd'], [
    { id: 'a', completed: false }, { id: 'b', completed: true },
    { id: 'c', completed: false }, { id: 'd', completed: false },
  ])
  assert.deepEqual(result, ['a', 'c', 'd'])
})
```

- [ ] **Step 2: Run and verify RED, then implement normalization**

Run: `node --test src/services/dailyPriorities.test.js`

Expected: FAIL before implementation, PASS after the pure normalizer is added.

- [ ] **Step 3: Implement the date-scoped hook and UI**

Persist `{ [yyyy-mm-dd]: [taskId, ...] }` through `usePersistedState('daily_priorities', {})`. Offer incomplete today/overdue tasks, allow zero to three selections, and use existing task toggles/focus actions.

- [ ] **Step 4: Recompose Today without deleting optional widgets**

Render core sections in this fixed order: greeting/date, recommendation, progress, rescue/important nudges, intention, Daily Big 3, focus/schedule, habits/routines/workout. Move Week Strip and optional module grid below them. Keep widget customization for optional IDs only; remove core action sections from the hideable registry.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
node --test src/services/dailyPriorities.test.js src/services/nextAction.test.js
npm.cmd run lint
npm.cmd run build
git add src/hooks/useDailyPriorities.js src/services/dailyPriorities* src/components/today src/pages/DashboardPage.jsx src/hooks/useWidgetPreferences.js
git commit -m "feat: make Today action-first with Daily Big 3"
```

### Task 7: Persist Focus Mode and connect the action loop

**Files:**
- Create: `src/services/focusSession.js`
- Create: `src/services/focusSession.test.js`
- Create: `src/hooks/useFocusSession.js`
- Create: `src/components/focus/FocusControls.jsx`
- Modify: `src/components/focus/FocusMode.jsx`
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/hooks/usePomodoroHistory.js`

**Interfaces:**
- Session shape: `{ taskId, durationSecs, remainingSecs, status, startedAt, lastTransitionAt, elapsedSecs }`.
- Produces `startSession`, `pauseSession`, `continueSession`, `stopSession`, and `remainingAt` pure functions.
- Dashboard recognizes `?focusTask=<id>#focus` and exposes `startFocus(taskId)`.

- [ ] **Step 1: Write failing state-machine tests**

Cover running-time derivation, pause freeze, continue, reload restoration, stop, expiry, invalid custom duration, and task completion. Include:

```js
test('derives remaining time across a reload', () => {
  const started = startSession({ taskId: 't1', durationSecs: 1500 }, 1_000)
  assert.equal(remainingAt(started, 61_000), 1440)
})
```

- [ ] **Step 2: Run and verify RED, then implement the pure state machine**

Run: `node --test src/services/focusSession.test.js`

Expected: FAIL before implementation; PASS with deterministic millisecond timestamps injected into every transition.

- [ ] **Step 3: Implement the persisted hook**

Persist one session under `focus_session`. Refresh visible remaining seconds every second only while running and reconcile on `visibilitychange`. Validate custom minutes as an integer from 1 to 240.

- [ ] **Step 4: Rebuild Focus Mode around explicit controls**

Show the selected task prominently. Provide 25/45/60/Custom options before start, then Continue/Start, Pause, Stop, and Complete Task according to state. Confirm Stop only after at least 60 elapsed seconds. Completing toggles the task if needed, logs actual focused minutes, clears the session, and calls `onComplete` so Dashboard returns to Today.

- [ ] **Step 5: Connect recommendation and deep-link selection**

Make Work On This Next and overdue Do now call the central `startFocus(taskId)`. Parse and clear `focusTask` similarly to existing `openTask` handling. Preserve hashes and queries with `URL`/`URLSearchParams`, never string concatenation.

- [ ] **Step 6: Verify and commit**

Run:

```powershell
node --test src/services/focusSession.test.js src/services/nextAction.test.js
npm.cmd run lint
npm.cmd run build
git add src/services/focusSession* src/hooks/useFocusSession.js src/components/focus src/pages/DashboardPage.jsx src/hooks/usePomodoroHistory.js
git commit -m "feat: persist task-focused sessions"
```

### Task 8: Make Quick Capture local-first and add Capture Inbox

**Files:**
- Create: `src/services/captureParser.js`
- Create: `src/services/captureParser.test.js`
- Create: `src/services/captureInbox.js`
- Create: `src/services/captureInbox.test.js`
- Create: `src/hooks/useCaptureInbox.js`
- Create: `src/components/capture/CaptureInbox.jsx`
- Modify: `src/components/quickcapture/QuickCapture.jsx`
- Modify: `src/components/capture/CaptureView.jsx`
- Modify: `src/components/braindump/BrainDump.jsx`
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/services/supabaseDataService.js`
- Modify: `src/services/nlpParser.js`
- Remove: `src/services/captureClassifier.js`
- Remove: `src/services/captureClassifier.test.js`

**Interfaces:**
- Produces `parseCapture(text, explicitType, now): { type, text, fields, confidence }`.
- Produces `normalizeInboxItem`, `canConvert`, and `markConverted`.
- `useCaptureInbox` exposes `{ items, add, archive, remove, convertToTask, convertToNote, convertToIdea }`.

- [ ] **Step 1: Write failing parser tests**

Cover prefixes and explicit types, `tomorrow at 2`, `14:30`, weekdays, `30 min`, `2 hours`, priority/category terms, numbers in titles, reminders, and blank input. Include:

```js
test('parses tomorrow at 2 without treating 2 as a calendar day', () => {
  const result = parseCapture('Call John tomorrow at 2', 'task', new Date('2026-08-12T09:00:00'))
  assert.equal(result.fields.title, 'Call John')
  assert.equal(result.fields.date, '2026-08-13')
  assert.equal(result.fields.dueTime, '14:00')
})
```

- [ ] **Step 2: Run and verify RED, then implement synchronous parsing**

Run: `node --test src/services/captureParser.test.js`

Expected: FAIL before implementation. Implement without importing `aiService` or using `fetch`.

- [ ] **Step 3: Write failing conversion-idempotency tests**

Assert archived filtering, converted target IDs, and rejection of a second conversion for the same inbox row.

- [ ] **Step 4: Implement inbox data and conversions**

Add `captureInboxService` for Supabase with explicit user filters and the same result contract. In demo mode use scoped persisted state. Conversion first creates the existing domain entity, then marks the inbox item converted with its target. If marking fails, retain the item with a recoverable error and its created target ID to prevent duplicate creation.

- [ ] **Step 5: Replace Quick Capture UI**

Use an accessible bottom sheet with Task, Reminder, Note, Idea, and Inbox pills. Save immediately from the local parser. Keep prefix shortcuts. Remove AI classification imports and submitting latency. Announce success through an `aria-live` region and close after a short reduced-motion-aware confirmation.

- [ ] **Step 6: Reuse parsing in Brain Dump and mount Inbox**

Add Inbox to `CaptureView` navigation. Brain Dump uses `parseCapture` for every line and routes low-confidence unstructured content to Inbox unless the user explicitly changes its type.

- [ ] **Step 7: Verify and commit**

Run:

```powershell
node --test src/services/captureParser.test.js src/services/captureInbox.test.js
npm.cmd test
npm.cmd run lint
npm.cmd run build
git add src supabase/migrations/202608120001_dayflow_v2_core.sql
git commit -m "feat: add local-first capture inbox"
```

### Task 9: Replace the overdue banner and expand evening review

**Files:**
- Create: `src/services/recovery.js`
- Create: `src/services/recovery.test.js`
- Modify: `src/components/tasks/OverdueRescue.jsx`
- Modify: `src/components/summary/EndOfDayReview.jsx`
- Modify: `src/components/today/TodayView.jsx`
- Modify: `src/pages/DashboardPage.jsx`

**Interfaces:**
- Produces `buildRecoveryQueue({ tasks, habits, routines, today })`.
- Produces `shouldOfferRecovery(queue)` using threshold: three overdue tasks or combined backlog of at least four with at least one overdue task.
- `OverdueRescue` accepts `onStartFocus`, `habits`, and `routines`.

- [ ] **Step 1: Write failing recovery-policy tests**

Cover thresholds, completed exclusion, missed-habit/routine construction, stable queue order, and date-scoped dismissal.

- [ ] **Step 2: Run and verify RED, then implement recovery policy**

Run: `node --test src/services/recovery.test.js`

Expected: FAIL before implementation; PASS after the pure queue builder is added.

- [ ] **Step 3: Implement the one-item reset UI**

Use neutral styling. Show queue counts, then one item with task actions Do now, Today, Tomorrow, Pick date, Delete; habit/routine actions Complete, Skip today, Open. Store dismissal as `{ [date]: true }`. Advance only after a successful local mutation.

- [ ] **Step 4: Expand evening review**

Summarize `completedAt` entries for the local date. Review unfinished today tasks with Move to tomorrow, Pick date, or Keep overdue. Offer Quick Capture via the existing global event. Finish writes `{ completedCount, unresolvedCount, finishedAt }` to `eod_reviews[today]` and suppresses repeat display.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
node --test src/services/recovery.test.js
npm.cmd run lint
npm.cmd run build
git add src/services/recovery* src/components/tasks/OverdueRescue.jsx src/components/summary/EndOfDayReview.jsx src/components/today/TodayView.jsx src/pages/DashboardPage.jsx
git commit -m "feat: add guilt-free daily recovery flows"
```

### Task 10: Normalize PWA shortcuts and secure internal deep links

**Files:**
- Create: `src/services/deepLinks.js`
- Create: `src/services/deepLinks.test.js`
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/App.jsx`
- Modify: `public/manifest.json`
- Modify: `public/sw.js`
- Modify: `src/utils/pwa.js`
- Modify: `vercel.json`

**Interfaces:**
- Produces `normalizeDeepLink(input): { pathname, search, hash } | null`.
- Produces `dashboardStateFromLocation(location): { tab, openTaskId, focusTaskId, action }`.
- Accepts only `/day`, `/tasks/:id`, `/focus/:id`, `/habits`, `/routines`, and `/dashboard`.

- [ ] **Step 1: Write failing allowlist tests**

Assert every approved mapping plus rejection of `https://evil.example`, `//evil.example`, backslash variants, unknown routes, and encoded traversal.

- [ ] **Step 2: Run and verify RED, then implement normalization**

Run: `node --test src/services/deepLinks.test.js`

Expected: FAIL before implementation. Decode once, reject control characters/backslashes/protocol-relative paths, and build state with `URLSearchParams`.

- [ ] **Step 3: Repair manifest actions and SPA entry handling**

Set shortcut URLs to `/dashboard?action=add-task`, `/dashboard?action=log-mood`, `/dashboard?action=focus`, and `/dashboard?action=habits`. Set the share target to `/dashboard?action=share`. Make add-task dispatch `dayflow:quickcapture` instead of setting unused state. Preserve authentication guard behavior.

- [ ] **Step 4: Remove native push handling from the root worker**

Delete `push` and `notificationclick` listeners because OneSignal becomes the only push handler. Ensure Supabase requests are always network-only rather than falling back to Cache Storage. Add `UPDATE_AVAILABLE` messaging and an explicit skip-waiting message instead of unconditional activation during install.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
node --test src/services/deepLinks.test.js
npm.cmd run lint
npm.cmd run build
git add src/services/deepLinks* src/pages/DashboardPage.jsx src/App.jsx public src/utils/pwa.js vercel.json
git commit -m "fix: secure DayFlow PWA entry points"
```

### Task 11: Replace native VAPID with OneSignal client integration

**Files:**
- Create: `src/services/oneSignalClient.js`
- Create: `src/services/oneSignalClient.test.js`
- Create: `src/hooks/useNotificationPreferences.js`
- Create: `src/components/notifications/NotificationSettings.jsx`
- Create: `public/push/onesignal/OneSignalSDKWorker.js`
- Modify: `src/hooks/useAuth.jsx`
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/components/dashboard/MobileDrawer.jsx`
- Modify: `src/components/dashboard/SideNav.jsx`
- Modify: `src/services/supabaseDataService.js`
- Remove: `src/services/pushNotificationService.js`
- Remove: `src/components/notifications/PushSetupPanel.jsx`
- Modify: `README.md`

**Interfaces:**
- Produces `createOneSignalClient({ appId, deferredQueue, origin })` with `init`, `identify`, `logout`, `requestPermission`, `getState`, and `subscribe`.
- Produces preference defaults and validation through `useNotificationPreferences`.
- Worker file contains only the OneSignal v16 `importScripts` call.

- [ ] **Step 1: Write failing client lifecycle tests**

Inject a fake Deferred queue/SDK and assert: missing App ID returns `unconfigured`; init uses `/push/onesignal/OneSignalSDKWorker.js` and `/push/onesignal/`; identify calls `login(userId)` only after init; logout calls SDK logout; permission is requested only by explicit method; state changes propagate from SDK listeners.

- [ ] **Step 2: Run and verify RED, then implement the feature-gated client**

Run: `node --test src/services/oneSignalClient.test.js`

Expected: FAIL before implementation. Do not access `window` at module evaluation time so tests and SSR-like tooling can import it.

- [ ] **Step 3: Add the official SDK and worker**

Have `oneSignalClient.init()` dynamically add `https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js` only when `VITE_ONESIGNAL_APP_ID` is non-empty, then await the Deferred callback before resolving. Mark the script `defer`, give it a stable DOM ID to prevent duplicate insertion, and turn load failure into the explicit `error` state. The worker contains:

```js
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js')
```

Initialize with `serviceWorkerPath`, `serviceWorkerParam: { scope: '/push/onesignal/' }`, and localhost allowance in development.

- [ ] **Step 4: Wire identity and sign-out order**

After auth resolution call `identify(user.id)` on every identified session/account change. During sign-out, await OneSignal logout with a bounded timeout, then unsubscribe realtime and call Supabase sign-out. A OneSignal failure must not trap the user in a signed-in session.

- [ ] **Step 5: Build notification settings**

Add a Settings subsection reachable from desktop and mobile navigation. Render overall enablement, permission/configuration state, eight category switches, morning/evening times, IANA timezone (default `Intl.DateTimeFormat().resolvedOptions().timeZone`), and quiet hours. Validate time strings and timezone before persistence. Request native permission only after the explanatory Enable button.

- [ ] **Step 6: Remove native VAPID paths**

Delete client `PushManager` code and references to `VITE_VAPID_PUBLIC_KEY`. Update README to list `VITE_ONESIGNAL_APP_ID` and explain the dedicated worker scope. Leave the old SQL table untouched by automatic migration but label it deprecated.

- [ ] **Step 7: Verify and commit**

Run:

```powershell
node --test src/services/oneSignalClient.test.js
npm.cmd test
npm.cmd run lint
npm.cmd run build
rg -n "VAPID|push_subscriptions|PushManager" src public index.html README.md
git add src public README.md
git commit -m "feat: replace native push with OneSignal"
```

Expected grep result: only historical/deprecation documentation, never active client code.

### Task 12: Implement contextual OneSignal scheduling in Supabase

**Files:**
- Create: `supabase/functions/process-notifications/policy.js`
- Create: `supabase/functions/process-notifications/policy.test.js`
- Create: `supabase/functions/process-notifications/handler.js`
- Create: `supabase/functions/process-notifications/index.ts`
- Create: `supabase/functions/process-notifications/handler.test.js`
- Create: `supabase/migrations/202608120002_notification_cron.sql`
- Create: `supabase/migrations/202608120002_notification_cron.test.js`
- Remove: `supabase/functions/send-push/index.ts`
- Remove: `supabase/functions/check-reminders/index.ts`
- Remove: `supabase/functions/daily-reminders/index.ts`
- Modify: `README.md`

**Interfaces:**
- Produces `isQuietTime`, `dailySendAllowed`, `buildNotificationCandidates`, and `buildOneSignalPayload` as pure functions in one JavaScript module imported by both Deno and Node tests.
- Produces `createNotificationHandler(dependencies)` so HTTP/auth/database/OneSignal behavior is testable without starting Deno.
- Edge Function accepts only requests bearing `Authorization: Bearer <CRON_SECRET>`.
- OneSignal targets `include_aliases.external_id`, `target_channel: "push"`, and includes an RFC 9562 UUID `idempotency_key`.

- [ ] **Step 1: Write failing notification-policy tests**

Cover overnight quiet hours, timezone conversion, disabled categories, completed task exclusion, reminder deduplication, recently acted items, morning planning, upcoming 15-minute windows, overdue summaries, habit/routine reminders, focus reminder, evening review, inactivity, one-per-hour throttle, three-per-day cap, and explicit reminder exemption.

- [ ] **Step 2: Run and verify RED, then implement shared pure policy**

Run: `node --test supabase/functions/process-notifications/policy.test.js`

Expected: FAIL before implementation. Keep the policy module free of Deno, browser, Supabase, and React globals. `index.ts` imports the JavaScript module through `handler.js`; Node tests import those exact same files, avoiding a second policy implementation.

- [ ] **Step 3: Write failing Edge Function request/payload tests**

Use injected `fetch`, clock, UUID, and repository objects. Assert unauthorized requests return 401, OneSignal credentials are read from injected environment, `Authorization` uses `Key`, non-empty OneSignal message IDs alone count as sent, and retryable attempts retain their idempotency key.

- [ ] **Step 4: Implement the scheduled worker**

Process candidate users in bounded batches. Query preferences, tasks, relevant `user_data`, and delivery history. Insert a pending logical delivery row before sending, call `https://api.onesignal.com/notifications`, then update sent/failed state. Never include task notes or capture content in logs. Return aggregate counts with no user-sensitive message bodies.

- [ ] **Step 5: Write and test Vault-based cron SQL**

The migration enables `pg_cron` and `pg_net`, then creates a five-minute job that reads `project_url` and `cron_secret` from `vault.decrypted_secrets`. Contract tests assert no literal project URL, anon/service key, or cron secret appears in SQL.

- [ ] **Step 6: Remove obsolete delivery functions and document deployment**

Document exact commands:

```bash
supabase functions deploy process-notifications --no-verify-jwt
supabase secrets set ONESIGNAL_APP_ID=... ONESIGNAL_REST_API_KEY=... CRON_SECRET=...
```

Also document the SQL/Vault names and that `--no-verify-jwt` is safe only because the function performs its own constant-time cron-secret check.

- [ ] **Step 7: Verify and commit**

Run:

```powershell
node --test supabase/functions/process-notifications/policy.test.js supabase/functions/process-notifications/handler.test.js supabase/migrations/202608120002_notification_cron.test.js
npm.cmd run lint
npm.cmd run build
git add supabase README.md
git commit -m "feat: add contextual OneSignal scheduler"
```

### Task 13: Complete mobile, accessibility, state, and PWA polish

**Files:**
- Modify: `src/components/ui/Modal.jsx`
- Create: `src/hooks/useDialogA11y.js`
- Modify: `src/components/quickcapture/QuickCapture.jsx`
- Modify: `src/components/dashboard/MobileDrawer.jsx`
- Modify: `src/components/focus/FocusMode.jsx`
- Modify: `src/components/tasks/OverdueRescue.jsx`
- Modify: `src/components/summary/EndOfDayReview.jsx`
- Modify: `src/components/notifications/NotificationSettings.jsx`
- Modify: `src/index.css`
- Modify: `src/layouts/DashboardLayout.jsx`
- Modify: high-traffic forms touched in Tasks, Today, Capture, and Settings.

**Interfaces:**
- Produces `useDialogA11y({ open, onClose, panelRef })` for focus trap, restoration, Escape, and body scroll lock.
- Adds shared classes `min-h-dvh`, `pb-safe-nav`, and reduced-motion overrides.

- [ ] **Step 1: Extract and apply one dialog behavior**

Move the proven Modal focus logic into `useDialogA11y`. Use a reference-counted body-lock so nested dialogs do not prematurely restore scrolling. Apply it to Modal, Quick Capture, and Mobile Drawer. Give every dialog a unique `aria-labelledby` ID via `useId`.

- [ ] **Step 2: Add viewport/safe-area and reduced-motion behavior**

Use `min-height: 100dvh` with `100vh` fallback, pad main content by bottom-nav height plus `env(safe-area-inset-bottom)`, and pad fullscreen/bottom-sheet controls. Under `prefers-reduced-motion: reduce`, disable smooth scrolling and non-essential animation/transition durations while retaining state visibility.

- [ ] **Step 3: Fix high-traffic semantics**

Associate labels and IDs for Quick Capture, Focus custom duration/task picker, overdue date picker, evening review inputs, notification times/timezone/quiet hours, task title/date/time/duration, and Daily Big 3 selection. Add `aria-pressed` to toggle pills, switch roles only where native checkboxes are not used, and useful live regions for sync/capture/focus completion.

- [ ] **Step 4: Make key states explicit**

For Today, Capture Inbox, Focus, rescue, and notification settings, render actionable loading, empty, success, error, and offline messaging. Do not claim server sync when a write is only queued. Provide retry actions for failed reads and preserve locally saved input.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
git diff --check
git add src
git commit -m "fix: polish mobile and accessible action flows"
```

### Task 14: Final performance review and regression verification

**Files:**
- Modify only files justified by measured final findings.
- Create: `docs/dayflow-v2-manual-qa.md`
- Modify: `README.md`

**Interfaces:**
- Produces an evidence-backed bundle comparison and complete manual QA checklist.
- Produces no new feature behavior.

- [ ] **Step 1: Run full clean verification**

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd audit --json
```

Record test totals, audit totals, and build chunk sizes. Any failure introduced by this branch must be fixed before proceeding.

- [ ] **Step 2: Inspect bundle and dependency usage**

Run:

```powershell
npx.cmd --yes depcheck --json
Get-ChildItem dist\assets -File | Sort-Object Length -Descending | Select-Object Name,Length
```

Remove only confirmed unused dependencies/files. Check that OneSignal is not included when `VITE_ONESIGNAL_APP_ID` is absent and that no OneSignal REST key string exists in `dist`.

- [ ] **Step 3: Run repository security checks**

```powershell
rg -n -i "ONESIGNAL_REST_API_KEY|SUPABASE_SERVICE_ROLE_KEY|CRON_SECRET|VAPID_PRIVATE|BEGIN .*PRIVATE KEY" src public dist
rg -n "\.from\('(?:tasks|capture_inbox|notification_preferences|notification_deliveries)'\)" src supabase
```

Expected: no server secrets in client/public/dist; all client data operations are owner-scoped or RLS-backed with explicit filters.

- [ ] **Step 4: Create the manual QA checklist**

Document exact desktop and installed-mobile checks for authentication, empty-account isolation, logout/account switch, Today hierarchy, recommendation, Big 3, Focus reload/pause/complete, Quick Capture types/NLP, Inbox conversions, overdue reset, evening review, notification permission states, navigation/deep links, Calendar, Schedule, Projects, Habits, Routines, Goals, Workouts, Capture, Insights, Search, themes, offline writes, service-worker update, and installation.

Mark browser automation as unavailable unless a browser backend becomes attached before this task.

- [ ] **Step 5: Review the complete branch diff**

Run:

```powershell
git diff master...HEAD --stat
git diff master...HEAD --check
git log --oneline master..HEAD
```

Read every changed file as a production pull-request review. Fix regressions, duplicated behavior, misleading copy, dead imports, unsafe defaults, and untested edge cases. Re-run the complete clean verification after any fix.

- [ ] **Step 6: Commit final QA documentation**

```powershell
git add docs/dayflow-v2-manual-qa.md README.md
git commit -m "docs: add DayFlow V2 deployment and QA guide"
```

### Task 15: Final review, push, and external-configuration handoff

**Files:**
- No product changes unless final review finds a verified defect.

**Interfaces:**
- Produces branch `dayflow_v2` pushed to `origin/dayflow_v2`.
- Produces exact user steps for Supabase and OneSignal configuration.

- [ ] **Step 1: Run the final verification gate from a clean install**

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd audit
git status --short --branch
```

Do not claim completion unless every command's fresh output has been read. Report any remaining audit advisories with package, severity, exploit surface, and upgrade constraint.

- [ ] **Step 2: Verify commit and branch state**

```powershell
git branch --show-current
git log -1 --format="%H %s"
git status --porcelain
```

Expected: branch is `dayflow_v2`, worktree is clean, and the latest commit is identified.

- [ ] **Step 3: Push without merging**

```powershell
git push -u origin dayflow_v2
```

If authentication or authorization fails, preserve all local commits and report the exact Git error.

- [ ] **Step 4: Provide the external configuration handoff**

List exact OneSignal dashboard origin/worker settings, frontend `VITE_ONESIGNAL_APP_ID`, Supabase migrations, Edge Function secrets `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`, and `CRON_SECRET`, deployment command, Vault secret names, cron creation, test subscription, and deep-link delivery checks. Never ask the user to paste secret values into chat.

- [ ] **Step 5: Report actual completion evidence**

Use the requested final structure: Branch, Summary, Bugs Fixed, DayFlow V2 Features, UI/UX Improvements, Performance, Supabase Changes, OneSignal, User Action Required, Testing, and Git. Clearly separate locally verified behavior from configuration-dependent live behavior.
