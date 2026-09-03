# Memory — DayFlow full rebrand + features session

Last updated: 2026-07-13

## What was built

**Phase A/B (bug audit):** Deleted a stale `src/hooks/useAuth.js` that had regrown and was shadowing the canonical `useAuth.jsx` (Vite resolves `.js` before `.jsx` on extensionless imports — broke password reset silently). Fixed duplicate `aria-label` in `TopBar.jsx`.

**Phase C (visual rebrand, specs in `docs/superpowers/specs/2026-07-12-dayflow-rebrand-design.md`):** New logo (`src/components/ui/Logo.jsx`, icon+wordmark, arc/flow motif), refined accent colors per theme in `src/index.css`, added `--radius-3xl`. Removed gamification entirely (`useXP.js`, `XPBadge.jsx`, `useAchievements.js`, `AchievementsView.jsx` deleted). Today view → bento grid (`BentoGrid.jsx`). Tasks → grouped-by-time-bucket (`TaskSection.jsx`) + two-column desktop/tabbed-mobile modal (`TaskModalDesktop/Mobile.jsx`). Habits → cards with streak-strip (`HabitCard.jsx`) + two-step wizard (`AddHabitWizard.jsx`). Workouts → weekly fitness rings (`WeeklyRings.jsx`) + template-picker modal. Routines → full-screen "run mode" (`RoutineRunMode.jsx`) + numbered step-builder (`StepBuilderCard.jsx`). Calendar → day-detail side panel (`DayDetailPanel.jsx`). Phase C2 propagated new tokens (soft-elevation card style) to all 12 remaining views (Goals/Insights/Notes/Focus/Balance/Bookmarks/BrainDump/Ideas/Projects/Weekly/Search/Onboarding) — restyle only, no layout changes.

**AI expansion (spec `2026-07-12-dayflow-ai-expansion-design.md`):** Migrated `/api/ai.js` from Anthropic to Groq (free tier, `llama-3.3-70b-versatile`) — same `{system,message}→{text}` contract. Added `src/services/captureClassifier.js` (AI intent classification: task/habit/routine/event, falls back to local `parseNLTask` on any failure) wired into `QuickCapture.jsx`/`QuickTaskBar.jsx`. Added AI scheduling suggestions (`getAIScheduleSuggestions` in `useSmartScheduler.js`) and AI-drafted routines/goals (`routinePlanService.js`).

**Accessibility (Phase D):** Fixed `Input.jsx` label/id association app-wide (`useId()`). Darkened dark-theme `--accent` `#6BBF83`→`#2E7D4F` (was failing WCAG AA, now ~5:1). Added keyboard support to `TaskSection.jsx` rows, converted the recurring-task toggle to a real checkbox, added `Modal.jsx` focus trap, `MobileDrawer.jsx` Escape/focus parity.

**Performance (Phase E):** Fixed `captureClassifier.js`'s dynamic import of `aiService.js` (was already statically imported elsewhere — dead-weight indirection, caused a recurring build warning). Added `React.memo`/`useCallback`/`useMemo` to `HabitCard`, `TaskSection`'s row, `WorkoutsView.jsx`'s derived data.

**Task reminders (spec `2026-07-13-task-reminders-design.md`):** Tasks get a `reminderTime` field (time picker in `TaskDetail.jsx`'s metadata rail) → client computes absolute `reminderAt` via `src/utils/reminders.js`'s `computeReminderAt(date, time)`. Recurring tasks inherit `reminderTime` per-occurrence via `recurringEngine.js`. New `supabase/functions/check-reminders/index.ts` (cron every 1 min, not yet deployed) finds due/unsent reminders and reuses the existing `send-push` function; tapping the notification deep-links via `?openTask=<id>` handled in `DashboardPage.jsx`/`TasksView.jsx`. Deleted the old tab-open-only `notificationService.js` (superseded).

**IA cleanup (spec `2026-07-13-ia-cleanup-design.md`):** Deleted Gratitude, Affirmations, Monthly Letter, Water Tracker, Balance, Challenges, and dead `VoiceCommandBar.jsx` (kept `VoiceJournal.jsx` — it's live). Rebalanced `useDailyScore.js` weights (tasks 44/habits 37/mood 19 = 100, was 35/30/15/gratitude10/water10). Consolidated Notes/Ideas/BrainDump/Bookmarks into one `CaptureView.jsx` with a type-filter (legacy tab-id calls transparently translated in `DashboardPage.jsx`'s `setActiveTab`). Folded Someday/Templates/Repeating into `TasksView.jsx` as filter chips. Added `Cmd/Ctrl+K` command palette (`src/components/palette/CommandPalette.jsx`) — navigate/capture, reuses `classifyCapture`. Nav went from ~20 destinations to 11.

**Custom workout types:** New `src/hooks/useCustomWorkoutTypes.js` (mirrors `useCustomCategories.js` exactly), wired into `WorkoutForm.jsx`'s Type picker with inline "+ Custom" add/remove, persisted via `usePersistedState('custom_workout_types', [])`.

## Decisions made

- No git commits made anywhere this entire session — user manages all commits/pushes manually. Everything is uncommitted working-tree edits on top of the original clone.
- Cloud/Supabase-only for reminders (no localStorage-mode fallback) — user confirmed acceptable.
- Command palette's `Cmd+K` is guarded against firing while a text input is focused (conservative default) — user has NOT yet decided whether to switch to Notion/Slack-style (fires even while typing). One-line change either way (`DashboardLayout.jsx`'s keydown guard).
- Kept `VoiceJournal.jsx` (still-used) despite memory previously claiming all voice features were deprecated — that claim was stale; only genuinely-dead `VoiceCommandBar.jsx` was removed.

## Problems solved

- **Real bug found via live browser testing (pre-existing, confirmed via `git show HEAD` to predate this whole session):** `TaskDetail.jsx` never resynced its local state (`priority`/`date`/`category`/`notes`/`reminderTime`) when a different task was opened — component stays mounted across task-opens, `useState` only initializes once. Editing any task after the first silently reverted its date/priority to stale defaults on save. Fixed with a `useEffect` keyed on `task?.id` that resyncs all fields. Verified live: date/priority now correctly persist through edits.
- Local demo-mode testing requires moving aside BOTH `.env` AND `.env.local` (both had real Supabase keys) — `isSupabaseConfigured()` checks either. Both were restored exactly after testing.
- `stopPropagation()` between two independent `window`-level `addEventListener` keydown listeners does nothing (Modal.jsx's Escape handler vs CommandPalette's) — fixed by moving CommandPalette's Escape handling onto a React `onKeyDown` on its own DOM root instead of a window listener, so it actually intercepts the bubble phase before it reaches window.

## Current state

- Build clean (`npm run build` succeeds, 0 errors). 14/14 unit tests pass (`node --test api/ai.test.js src/utils/reminders.test.js src/services/captureClassifier.test.js`).
- Live-tested in browser (demo mode): nav, task creation/NLP parsing/grouping, theme switching (Light/Dark/Forest), Habits view, TaskDetail editing all confirmed working. Command palette NOT live-tested (browser tooling hit rate limits mid-session) — code-reviewed only.
- Nothing committed or pushed. `.claude/launch.json` added (vite dev server config for browser preview tooling).
- Two manual deploy steps outstanding, only the user can do these (no CLI session available here):
  1. Run `supabase/migration-task-reminders.sql` in Supabase SQL editor
  2. Deploy `supabase/functions/check-reminders/index.ts` + schedule via Supabase Dashboard Cron Jobs (every 1 min)
- `GROQ_API_KEY` is already set in `.env` — AI features need `vercel dev` (not plain `vite dev`) to actually reach `/api/ai`.

## Next session starts with

- Nothing queued. If resuming: confirm the two Supabase manual steps above got done, then do a live test of a real reminder firing end-to-end (needs a real device with push permission granted via `PushSetupPanel.jsx`).
- Command palette (`Cmd+K`) still needs live browser verification — was only code-reviewed.

## Open questions

- Cmd+K input-focus guard: keep conservative (current) or switch to Notion/Slack-style always-fires? User hasn't decided.
- `views-core` bundle chunk is the largest (didn't restructure lazy-load boundaries this session — flagged, not fixed).
- Deferred from IA cleanup brainstorm, not started: global undo stack, offline-conflict-resolution audit, working export/import round-trip.
