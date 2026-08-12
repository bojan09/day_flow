# DayFlow V2 Design

**Date:** 2026-08-12
**Branch:** `dayflow_v2`
**Status:** Approved for implementation planning

## Purpose

DayFlow V2 evolves the existing application into a calmer, more proactive daily system. It must make the next useful action obvious, make capture nearly effortless, help users recover from overdue work without guilt, and deliver contextual reminders without duplicating the product's existing task, habit, routine, project, workout, and capture systems.

This is an incremental redesign of the existing React, Vite, Tailwind, Supabase, and PWA application. It is not a rewrite. Existing visual identity and working modules remain intact.

## Product principles

- Put the most useful current action ahead of analytics, motivational content, and customization controls.
- Extend existing concepts instead of creating parallel task, capture, focus, or review systems.
- Keep recommendations deterministic and explainable.
- Capture locally and immediately; enrichment must never block saving.
- Treat reminders as opt-in assistance, not default interruption.
- Prefer recovery language and reversible choices over warning-heavy overdue flows.
- Protect user data across authentication changes, offline replay, and local caches.
- Keep all production secrets server-side.

## Existing architecture

The application uses React 18 with Vite 5, React Router 6, Tailwind CSS, `date-fns`, Supabase Auth/Database/Realtime/Storage, a hand-written service worker, and Vercel hosting. It supports a local-only demo mode when Supabase is not configured.

`DashboardPage` owns feature hooks and switches dashboard modules through a URL hash. Domain hooks manage local state, Supabase reads and writes, realtime refreshes, and localStorage fallbacks. Structured tables store tasks, notes, habits, goals, ideas, projects, and bookmarks. The `user_data` table stores other feature state as JSON values. Existing feature surfaces include Today, Tasks, Focus, Quick Capture, Capture/Brain Dump, Overdue Rescue, and End-of-Day Review.

## Phase 1 audit findings

### Critical and high priority

1. **Cross-user local data exposure:** structured feature hooks use global localStorage keys such as `dayflow_tasks`. When a signed-in account has no server rows, several hooks keep whatever local data was previously present. An account switch can therefore display demo data or another account's cached records.
2. **Cross-user offline replay risk:** the offline queue is global and can replay serialized user writes after authentication changes. Replay handlers also exist only in memory, so writes surviving a reload may be silently removed without executing.
3. **Broken push transport:** the native `send-push` Edge Function posts an unencrypted JSON body directly to a browser push endpoint without Web Push signing or encryption. It can count non-successful HTTP responses as sent.
4. **Invalid push migration:** `push-subscriptions.sql` declares an expression inside a table-level `UNIQUE` constraint, which PostgreSQL does not support.
5. **Incomplete mutation failure handling:** several Supabase services log write failures but do not reject. Optimistic UI may appear successful while remote persistence failed.
6. **Schema drift:** task mappers write recurrence and reminder columns that are spread across follow-up SQL files rather than a single current migration chain. The repository itself notes that missing recurrence columns have previously blocked all task writes.

### Product and UX gaps

1. The Today page surfaces Week Strip and multiple nudges before its greeting and mixes static action widgets with a large adaptive widget registry. This dilutes the next-action hierarchy.
2. The existing recommendation uses a fixed precedence chain. It does not score due time, schedule proximity, duration, project importance, or future-task penalties, and it cannot start Focus Mode with the selected task.
3. Focus Mode stores timer state only in component memory, offers only a 25-minute focus duration, and has no explicit Continue, Stop, or Complete action. Reloading or navigating away loses progress.
4. Quick Capture performs a server AI call for ordinary task input, but ignores the returned capture type and only consumes task fields. The network request makes a three-second capture less reliable.
5. Natural-language parsing removes time expressions from titles but does not persist the parsed time. Its general number matching can mistake times or durations for calendar dates.
6. The existing overdue banner reschedules every overdue task at once and uses strong warning styling. It does not support one-item recovery decisions or missed habits/routines.
7. End-of-day review records reflection fields but does not help resolve unfinished tasks.
8. PWA shortcuts set an unused `showQuickCapture` state, route via `/` even though demo mode redirects to Welcome, and the share-target action does not match a declared application route.
9. The push settings component is not mounted. It claims fixed 8am behavior, has no category preferences, quiet hours, timezone, or denied-permission guidance.

### Performance, maintenance, and accessibility

1. `npm audit` reports nine advisories in the installed dependency tree: one low, four moderate, and four high. Safe compatible updates exist for several packages; the Vite upgrade requires controlled verification.
2. GSAP is declared but not imported; `PageTransition` only checks for an undeclared global `window.gsap`.
3. Vite emits an empty `vendor-supabase` chunk due to the manual chunk strategy.
4. There is no lint, type-check, component-test, or end-to-end script. Existing coverage is 14 Node tests around the API proxy, capture classification, and reminder timestamp calculation.
5. Generic `Modal` leaves the page scrollable behind it. Quick Capture implements another modal without dialog semantics, focus trapping, focus restoration, or scroll locking.
6. Reduced-motion behavior is not defined globally. Safe-area support exists for bottom navigation but is inconsistent across fullscreen overlays and main content.
7. Several forms use visual labels without programmatic association. The implementation pass will prioritize modified and high-traffic flows rather than rewrite every form.

## Delivery strategy

Implementation is divided into independently testable slices. Data safety comes first because later features build on persistence. The action loop follows, then OneSignal infrastructure, then the cross-cutting performance/accessibility/PWA pass. Each slice ends with targeted tests and a logical commit.

## 1. Data safety and persistence

### Storage identity

Local persistence gains an explicit scope:

- `demo` for local-only mode;
- `user:<supabase-user-id>` for authenticated data;
- `device` for genuinely device-wide preferences such as the install prompt dismissal.

User data keys use a versioned form such as `dayflow_v2:user:<id>:tasks`. The first authenticated load may read legacy keys only through the existing migration flow. It must never silently treat legacy data as belonging to a newly authenticated user.

### Server loading

Supabase services return distinguishable success and failure outcomes. A successful query returning `[]` is authoritative and clears that user's cached collection. A failed query preserves the same user's last cached value and surfaces a sync error. Empty arrays and objects remain valid saved values in `user_data`.

### Offline writes

Queued writes record owner ID, operation type, entity key, payload, and queue time. Replay occurs only when the active user matches the owner. A registry of stable operation types rehydrates handlers after reload; unknown operations remain queued and surface an error instead of being discarded. Logout clears in-memory feature state and detaches realtime channels without deleting another account's scoped cache.

### Database safety

All client queries and mutations retain explicit `user_id` filters even though RLS is enabled. New tables enable RLS and use `auth.uid() = user_id` policies with both `USING` and `WITH CHECK`. Service-role access is limited to scheduled Edge Functions. Migrations are additive and reproducible; no production rows are deleted.

## 2. Deterministic next-action engine

A pure module becomes the single source of truth for ranking actionable tasks. It accepts tasks, current time, project metadata, and daily-priority IDs and returns ranked candidates with a numeric score and human-readable reasons.

The initial scoring model is:

| Factor | Score |
|---|---:|
| Pinned focus task | +120 |
| Daily priority | +80 |
| Overdue | +70 plus up to 20 for age |
| Due today | +60 |
| High / medium / low priority | +35 / +15 / +0 |
| Scheduled within 60 / 180 minutes | +40 / +25 |
| Already started | +20 |
| Estimate 5–45 / 46–90 minutes | +12 / +5 |
| Active project with near due date | +15 |
| Future task | −25 per day, capped at −100 |

Completed tasks and paused recurring templates are excluded. Invalid dates are treated as unscheduled. Ties resolve by due/scheduled time, creation time, then stable ID. Scoring constants are exported and tested so future tuning remains understandable.

The recommendation card shows the top reasons, duration, priority, and due context. Its primary action launches Focus Mode with that task. An empty state says the user is clear rather than hiding the section.

## 3. Action-first Today page

The fixed top hierarchy becomes:

1. Greeting and date;
2. Work On This Next;
3. Today's progress;
4. Significant alerts, including the overdue-reset offer;
5. Today's intention;
6. Today's Priorities;
7. Focus tasks and schedule;
8. Habits, routines, and workout;
9. Optional secondary modules and evening review.

The existing widget customization system remains for secondary sections. Core action-loop sections cannot accidentally be hidden or pushed below all optional modules. Smart Morning Brief becomes secondary and never blocks action content. The Week Strip moves below the action header.

## 4. Daily priorities

Daily Big 3 stores up to three task IDs for each local calendar date in `user_data`; it does not copy tasks. Users may select zero to three incomplete tasks, reorder them, remove them, complete them, or start focus. Deleted task references are removed during read normalization. Daily priorities add weight to the recommendation engine and contribute to progress without creating a second completion state.

## 5. Focus Mode

Focus uses a persisted session record containing task ID, selected duration, remaining seconds, status, start timestamp, last transition timestamp, and accumulated elapsed time. The timer derives remaining time from timestamps instead of relying on interval ticks, preventing drift while the tab sleeps.

Supported durations are 25, 45, 60, and a validated custom value from 1 to 240 minutes. States are idle, running, paused, and finished. Controls are Start/Continue, Pause, Stop, and Complete Task. Stop requires confirmation only when meaningful progress exists. Reload restores the session. Completing a task updates the task, logs focus history, clears the session, returns to Today, and recomputes the next recommendation.

Focus navigation uses the existing dashboard architecture through a small central navigation/deep-link utility. URLs remain compatible with `/dashboard#focus`; notification paths such as `/focus/:id` are normalized by the SPA into that internal state instead of introducing a second router tree.

## 6. Quick Capture and Capture Inbox

Quick Capture is a compact accessible bottom sheet with a single focused input and explicit Task, Reminder, Note, Idea, and Inbox choices. Prefix shortcuts remain supported for experienced users but are not required knowledge.

The local parser extracts relative dates, weekdays, `at` times, common 12/24-hour formats, priority words, categories, and duration. Parsing is synchronous. Advanced task details remain available after capture but never block the initial save.

Unstructured Inbox items are stored in a new `capture_inbox` table when Supabase is configured and in user-scoped local storage in demo mode. Each row contains text, optional inferred type, structured fields JSON, status, timestamps, and user ID. Inbox actions convert to an existing task/note/idea, schedule as a task, attach a converted task to an existing project, archive, or delete. Conversion records the target type and ID to prevent duplicate conversions. Brain Dump reuses the same classifier and conversion functions.

## 7. Overdue rescue and evening review

The overdue reset offer appears only when there are at least three overdue tasks or a combined meaningful backlog of overdue tasks, missed habits, and unfinished routines. Dismissal is date-scoped. The flow reviews one item at a time with Do now, Today, Tomorrow, Pick date, and Delete for tasks. Habit and routine items offer Complete, Skip today, and Open.

Do now launches Focus Mode. Task rescheduling uses the existing task mutation. The visual language uses neutral recovery colors and reports progress through the reset queue.

The evening review appears after the user's configured evening time. It summarizes tasks completed today and walks unfinished tasks through Move to tomorrow, Pick date, or Keep overdue. It offers Quick Capture and a Finish Day action. Finishing writes a compact date-scoped review and suppresses repeat prompts for that date.

## 8. OneSignal-only notification architecture

### Client

Native VAPID code, browser `PushManager` subscription storage, custom push event rendering, and `push_subscriptions` usage are removed. OneSignal Web SDK v16 is loaded only when `VITE_ONESIGNAL_APP_ID` is present. DayFlow initializes it with a dedicated worker at `/push/onesignal/OneSignalSDKWorker.js` and a `/push/onesignal/` scope so the existing root PWA worker remains responsible for offline caching.

After Supabase authentication resolves, DayFlow calls `OneSignal.login(user.id)` on every identified session and account change. Sign-out calls `OneSignal.logout()` before Supabase sign-out to unlink the browser from targeted messages. The client never receives the OneSignal REST API key.

Permission is requested only after the user enables notifications from a settings explanation. Denied, default, granted, unsupported, and configuration-missing states have distinct guidance. Subscription state is observed through OneSignal SDK events rather than assumed from a toggle.

### Preferences

A `notification_preferences` table stores one row per user:

- category booleans for morning planning, upcoming tasks, overdue tasks, habits, routines, focus reminders, evening review, and inactivity;
- morning and evening local times;
- quiet-hours start and end;
- IANA timezone;
- enabled state;
- last app-open and last planning timestamps;
- created and updated timestamps.

Defaults enable morning planning, upcoming tasks, overdue tasks, routines, and evening review; habits, focus reminders, and inactivity default off. The user explicitly enables the overall notification system.

### Delivery history

A `notification_deliveries` table stores user ID, category, source type and ID, scheduled bucket, OneSignal message ID, idempotency UUID, status, and timestamps. A unique logical key prevents redundant category/item/time-bucket sends. Rows support debugging without storing message bodies or secrets.

### Scheduler Edge Function

A single `process-notifications` Edge Function is invoked every five minutes. It authenticates cron requests with `CRON_SECRET`, loads candidate preferences whose local time is relevant, enforces quiet hours, derives contextual candidates from current tasks and `user_data`, checks delivery history, and sends targeted OneSignal messages using:

- `include_aliases.external_id = [user_id]`;
- `target_channel = "push"`;
- `app_id = ONESIGNAL_APP_ID`;
- `Authorization: Key ONESIGNAL_REST_API_KEY`;
- an RFC 9562 UUID `idempotency_key`;
- a validated same-origin deep-link URL.

The function records success only when OneSignal returns a non-empty message ID. Retryable failures retain the same idempotency key. Categories are evaluated independently, but a per-user cap prevents more than three automated notifications per day and one per hour, excluding explicit task reminders. Morning and evening messages summarize rather than fan out per task.

Cron configuration is supplied as a migration using `pg_cron`, `pg_net`, and Supabase Vault references. Secrets are never embedded in SQL committed to Git.

### Deep links

Only known internal destinations are accepted. Notification targets normalize to:

- `/day` → `/dashboard#today`;
- `/tasks/:id` → `/dashboard?openTask=:id#tasks`;
- `/focus/:id` → `/dashboard?focusTask=:id#focus`;
- `/habits` → `/dashboard#habits`;
- `/routines` → `/dashboard#routines`.

The service worker and application router both preserve query and hash state. External or protocol-relative URLs are rejected.

## 9. PWA, mobile, accessibility, and states

- Repair manifest shortcuts and share-target behavior to enter authenticated/demo dashboard flows safely.
- Keep root navigation network-first and immutable build assets cache-first.
- Never cache Supabase API responses or authenticated data in Cache Storage.
- Add controlled service-worker update signaling rather than silently changing active code mid-session.
- Use dynamic viewport units where fullscreen mobile UI needs them and apply safe-area padding to bottom sheets, Focus Mode, and fixed actions.
- Consolidate bottom-sheet/dialog behavior around focus trapping, labelled dialogs, Escape/backdrop close, focus restoration, and body scroll locking.
- Add reduced-motion fallbacks for page transitions, modal animation, progress animation, and celebration effects.
- Ensure modified controls have visible focus, semantic elements, accessible names, associated form labels, and at least 44-by-44 CSS-pixel touch targets where practical.
- Important views explicitly represent loading, empty, error, success, and offline states. Network failures state what was preserved and what action can retry.

## 10. Performance and maintenance

- Remove unused GSAP and dead references reached during modified flows.
- Replace brittle manual chunk grouping with measured route/feature splitting that does not emit empty chunks.
- Lazy-load secondary views and OneSignal only when configured/needed; Today, Tasks, and the active action loop remain fast.
- Apply compatible dependency security updates first. A major Vite update is accepted only if the full test/build/PWA checks remain green.
- Add ESLint for JavaScript/JSX and a consistent `npm test` command using the existing Node test runner. Type validation remains build-time JavaScript checking rather than a repository-wide TypeScript migration.
- Keep refactors local to code needed by these phases. Large existing files are split only when the V2 behavior would otherwise create mixed responsibilities.

## 11. Testing and validation

### Automated tests

Tests cover:

- next-action scoring, exclusions, reasons, and deterministic ties;
- date/time/duration parsing and capture routing;
- user-scoped storage and authoritative empty-server behavior;
- offline queue ownership and reload replay;
- focus timer restoration, transitions, completion, and next-task selection;
- Daily Big 3 normalization;
- overdue rescue decisions and evening rescheduling;
- notification preference validation, timezone/quiet-hours logic, throttling, candidate selection, deep-link validation, and OneSignal payloads;
- Edge Function authentication and OneSignal response handling using injected fetch/data boundaries;
- PWA shortcut/deep-link normalization.

### Quality gates

Before each logical commit, run the focused test files. Before completion, run:

```bash
npm ci
npm run lint
npm test
npm run build
npm audit
```

If browser automation becomes available, run desktop and mobile smoke tests for authentication, Today, Tasks, Capture, Focus, overdue reset, Daily Big 3, evening review, notification settings, navigation, themes, and logout/login. If it remains unavailable, report that limitation explicitly and provide a manual verification checklist. Live push delivery cannot be claimed until OneSignal and Supabase secrets are configured on deployed HTTPS origins.

## 12. Migration and rollback

Database changes are additive. New tables can remain unused if the frontend is rolled back. Existing native push tables and functions are deprecated in repository configuration but the migration does not drop production tables automatically; removal is provided as an optional later cleanup after OneSignal delivery is proven. Existing task reminder columns remain for scheduling semantics even though OneSignal becomes the transport.

The frontend treats a missing new table or missing OneSignal App ID as a configuration error limited to that feature. Core tasks and local demo mode continue to work. OneSignal code is feature-gated by configuration.

## 13. User-supplied configuration deferred to the final stage

Implementation can proceed without secret values. Final deployed validation requires the user to:

1. Create or select production and, preferably, localhost OneSignal web apps.
2. Configure the exact production HTTPS origin and the worker path `/push/onesignal/`.
3. Set `VITE_ONESIGNAL_APP_ID` in the frontend host.
4. Set `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`, and `CRON_SECRET` as Supabase Edge Function secrets.
5. Apply the generated Supabase migrations.
6. Deploy `process-notifications` and configure the generated cron/Vault entries.
7. Subscribe a test browser and complete the provided delivery/deep-link checklist.

## Acceptance criteria

- No authenticated account can display or replay another account's locally cached data.
- A successful empty Supabase result clears the signed-in user's corresponding UI collection.
- Work On This Next is deterministic, explainable, and starts Focus Mode with the recommended task.
- Focus state survives reload and supports 25, 45, 60, and custom durations plus Continue, Pause, Stop, and Complete.
- Quick Capture saves synchronously without AI and supports Task, Reminder, Note, Idea, and Inbox.
- Daily priorities reference existing tasks and influence recommendation and progress.
- Overdue reset reviews items individually and does not repeatedly interrupt after dismissal/completion.
- Evening review resolves unfinished tasks in a short flow.
- Native VAPID subscription and delivery code is no longer used; OneSignal is the only push transport.
- Notification categories, timezone, quiet hours, subscription state, throttling, and idempotent delivery are user-scoped.
- OneSignal secrets never appear in frontend bundles or committed files.
- Existing modules remain reachable and functional.
- Lint, automated tests, and the production build pass at completion.
- Any untestable live integration or browser/PWA behavior is reported accurately with exact user actions.
