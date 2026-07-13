# Task-Specific Push Notification Reminders — Design Spec

Date: 2026-07-13
Status: Approved, pending implementation plan

## Context

DayFlow already has real (not stubbed) push notification infrastructure: `src/services/pushNotificationService.js` (VAPID subscribe/unsubscribe, stores subscriptions in Supabase `push_subscriptions`), `supabase/functions/send-push/index.ts` (sends a Web Push payload to every subscribed device for a user), and `supabase/functions/daily-reminders/index.ts` (a cron-triggered daily digest of tasks due "today," fixed 8am UTC). There is also a local-only `src/services/notificationService.js` (browser `Notification` API + `setTimeout`, references a `task.reminderAt` field that nothing in the UI currently sets) — it only fires while a tab is open, so it can't satisfy "notify me even when the app/browser is closed."

Gap: nothing lets a user pick a reminder time on a specific task and have that reliably trigger a push notification at that time.

## Goal

Let a user set a reminder time on any task (including recurring ones) and receive an actual OS-level push notification on their phone (PWA installed via Chrome) at that time — even with the app fully closed — that opens straight to that task when tapped.

## Non-goals

- Demo/localStorage-only mode is not supported — this feature requires being signed in with Supabase configured (confirmed acceptable). No degraded local-only fallback.
- No snooze or repeat-reminder UI — a reminder fires once per task occurrence, that's it.
- No new dependencies — built entirely on existing VAPID/push/edge-function infrastructure.
- Not touching `daily-reminders` (the existing 8am digest) — separate, unrelated feature, stays as-is.

## Data model

- **`tasks` table** (Supabase) gains three columns:
  - `reminder_time text` — nullable, `HH:MM` string, what the user picks in the UI.
  - `reminder_at timestamptz` — nullable, absolute UTC timestamp derived client-side from `task.date` + `reminder_time` in the browser's local timezone at the moment the task is saved (or re-derived whenever `date`/`reminder_time` changes). This is the field the cron function actually queries — no server-side timezone math needed.
  - `reminder_sent boolean default false` — idempotency flag, set `true` once a push has been dispatched for this specific task row.
- **camelCase client-side equivalents**: `reminderTime`, `reminderAt`, `reminderSent` on the task object in `useTasks.js`, following the existing `dueTime`-style field convention. Added to `src/services/mappers.js`'s camelCase↔snake_case pass-through (existing architecture convention — "all Supabase reads/writes pass through mappers.js").
- **Recurring tasks**: `reminderTime` lives on the recurring template task. `src/services/recurringEngine.js`'s `spawnRecurringTasks()` (which already calls `addTask({...})` once per day to create that day's instance) copies `reminderTime` onto the new instance and computes that instance's own `reminderAt` from its own `date` + the copied `reminderTime` — "every occurrence gets a reminder" falls directly out of this existing spawn mechanism, no new recurrence-specific logic required.
- Non-recurring tasks: `reminderAt` is recomputed any time `date` or `reminderTime` changes via `updateTask`, so it never goes stale relative to a rescheduled task.

## Server-side delivery

- New Supabase edge function: `supabase/functions/check-reminders/index.ts`.
- Cron-triggered every 1 minute via Supabase Cron Jobs (same dashboard-configured mechanism `daily-reminders` already documents in its header comment), gated by the same `CRON_SECRET` bearer-token pattern.
- Query: `tasks` where `reminder_at <= now()` AND `reminder_sent = false` AND `completed = false`.
- For each matching row: call the existing `send-push` function (unchanged — it already fans out to every device subscribed for that `user_id`) with:
  - `title: "⏰ {task.title}"`
  - `body`: task category or a short snippet (match `daily-reminders`'s existing body-construction style)
  - `url: "/dashboard?openTask={task.id}"`
- Immediately after a successful dispatch, set `reminder_sent = true` on that row — this is the idempotency guard that stops the next minute's poll from re-sending the same reminder.
- Migration file: `supabase/migration-task-reminders.sql` — adds the 3 columns + a partial index: `create index ... on tasks (reminder_at) where reminder_sent = false and completed = false` (keeps the cron query cheap as the table grows).

## Client-side

- `src/components/tasks/TaskModalDesktop.jsx` (metadata rail) and `TaskModalMobile.jsx` (Details tab) — both get a new "Remind me at" `<input type="time">`, styled/positioned like the existing due-time field in `TaskForm.jsx`, wired to `reminderTime` on the task and triggering the `reminderAt` recomputation on change.
- `src/pages/DashboardPage.jsx` — on mount, reads an `?openTask=<id>` query param (from the push notification's `url`) and opens `TaskDetail` for that task automatically. Small, additive — not a modal-system redesign.
- `src/services/mappers.js` — add `reminder_time`/`reminder_at`/`reminder_sent` ↔ `reminderTime`/`reminderAt`/`reminderSent` mappings.
- **Cleanup**: delete `src/services/notificationService.js` and its call sites. It's now fully superseded — running a local `setTimeout`-based reminder system alongside the push-based one would mean two competing notification paths for the same concept, which is unnecessary duplication now that push covers every case this feature needs.

## Error handling / edge cases

- If a task's reminder time has already passed when the task is created (e.g. user picks a time earlier today), `reminderAt` still gets computed and stored — the next cron tick will pick it up and fire immediately (matches "better to notify late than never" for a reminder feature).
- If a task is deleted before its reminder fires, the row is gone, so the cron query simply won't match it — no orphaned-reminder cleanup needed.
- If a task is marked completed before its reminder fires, the `completed = false` clause in the cron query excludes it — no notification sent for already-done tasks.
- If `send-push` fails for a given task (e.g. all subscriptions expired), `check-reminders` should still mark `reminder_sent = true` to avoid retry-spamming on every subsequent minute for a permanently-undeliverable reminder — a failed send isn't retried.

## Open items for implementation planning

- Confirm Supabase Cron Jobs supports a 1-minute schedule on the account's current tier (the `daily-reminders` function's existing comment implies dashboard-configurable cron already works for this project — verify the minimum interval at implementation time).
- Exact `body` text format for the reminder push — match whatever style `daily-reminders` already uses for consistency.
