# DayFlow V2 deployment and manual QA

Automated checks cover the pure domain logic, storage isolation, notification request boundary, SQL contracts, lint, production compilation, and dependency audit. Browser automation was unavailable during implementation, so the interaction, installed-PWA, and live OneSignal checks below remain operator checks.

## Deployment checklist

1. Configure the production frontend with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_ONESIGNAL_APP_ID`.
2. In the OneSignal Web app, set the exact production site origin. Do not configure the retired VAPID client integration in DayFlow.
3. Apply `supabase/migrations/202608120001_dayflow_v2_core.sql`, then `supabase/migrations/202608120002_notification_cron.sql`.
4. Set Edge Function secrets without sharing their values in chat or committing them: `supabase secrets set ONESIGNAL_APP_ID=... ONESIGNAL_REST_API_KEY=... CRON_SECRET=... PUBLIC_APP_URL=https://your-dayflow-domain.example`.
5. Add Supabase Vault secrets named `project_url` and `cron_secret`. The latter must equal the Edge Function `CRON_SECRET`.
6. Deploy with `supabase functions deploy process-notifications --no-verify-jwt`. The function performs its own constant-time bearer-secret check.
7. Confirm the `dayflow-process-notifications` cron job exists and runs every five minutes.
8. Deploy the frontend over HTTPS, then confirm `/push/onesignal/OneSignalSDKWorker.js` returns JavaScript and is controlled at `/push/onesignal/`.

## Core account and data safety

- [ ] Create or use two test accounts. Add different tasks to each, sign out, switch accounts, and verify neither account sees the other's cached or synced data.
- [ ] Verify a brand-new account with an empty remote dataset remains empty and does not inherit demo or earlier-user records.
- [ ] Queue a write while offline, reload, reconnect under the same account, and verify it replays once.
- [ ] Switch accounts before reconnecting and verify the first account's queued write does not replay as the second account.
- [ ] Sign out and verify the OneSignal external identity is cleared before the auth session redirects to Welcome.

## Action loop

- [ ] Today shows Daily Big 3 and the recommended next action before secondary widgets.
- [ ] Pin up to three existing tasks; reload and verify references persist without duplicating tasks.
- [ ] Verify the recommendation changes predictably with due date, priority, duration, energy, and overdue state, and its explanation is understandable.
- [ ] Start Focus from a task. Test 15/25/45/custom durations, pause/resume, reload recovery, completion, and cancellation.
- [ ] Open a `/focus/:taskId` and `/tasks/:taskId` deep link. Verify unknown, external, protocol-relative, and encoded-traversal paths are rejected safely.

## Capture and recovery

- [ ] Use Quick Capture from desktop, mobile, the command palette, and the PWA Add Task shortcut.
- [ ] Capture plain tasks, reminders with date/time, notes, ideas, and duration phrases while offline; verify saving never waits for AI or network access.
- [ ] Organize Capture Inbox items into tasks, notes, and ideas; verify a repeated conversion cannot create duplicates.
- [ ] Trigger an overdue reset and process one item at a time with Do now, Today, Tomorrow, Pick date, and Delete.
- [ ] Complete the evening review, resolve unfinished tasks, and verify it stays dismissed for that local date.

## Navigation, accessibility, and responsive UI

- [ ] At 320 px, 768 px, and desktop widths, inspect Today, Tasks, Focus, Capture, Insights/Settings, Calendar, Schedule, Projects, Habits, Routines, Goals, Workouts, and Search.
- [ ] Navigate dialogs and the mobile drawer with keyboard only. Verify initial focus, Tab containment, Escape close, focus restoration, labels, and background scroll locking.
- [ ] On a safe-area mobile device, verify bottom navigation and fullscreen controls are not obscured.
- [ ] Enable reduced motion and verify non-essential animation is removed while state changes remain visible.
- [ ] Test Light, Dark, and Forest themes for readable text, inputs, focus rings, selected states, and disabled states.

## PWA and OneSignal

- [ ] Install the PWA and exercise the manifest shortcuts and share target.
- [ ] Load once, go offline, and verify the app shell and same-user cached content open. Confirm Supabase API responses are never served from Cache Storage.
- [ ] Deploy a new service worker and verify the update prompt/activation path does not interrupt an active session.
- [ ] In notification settings, verify the SDK is clearly unconfigured without an App ID and that native permission is requested only after clicking Enable.
- [ ] Test denied, dismissed, and granted permission states. Confirm preference switches, times, timezone, and quiet hours persist after reload.
- [ ] Subscribe a test account, schedule a task reminder, and verify a single OneSignal delivery opens the intended task URL.
- [ ] Invoke the cron endpoint with a wrong bearer token and expect 401. Run the cron twice and verify the same logical reminder is not delivered twice.
- [ ] Inspect `notification_deliveries`: successful rows contain a OneSignal message ID and sent timestamp; the source task has `reminder_sent = true`; failures retain their idempotency key and no secret or private task content appears in logs.

## Release acceptance

- [ ] `npm ci`, `npm run lint`, `npm test`, `npm run build`, and `npm audit` all pass from a clean checkout.
- [ ] No OneSignal REST API key, Supabase service-role key, cron secret, VAPID private key, or private key material appears in `src`, `public`, or `dist`.
- [ ] The deployed app has no active `PushManager`, VAPID, or legacy native-push delivery path; OneSignal is the only remote push transport.
