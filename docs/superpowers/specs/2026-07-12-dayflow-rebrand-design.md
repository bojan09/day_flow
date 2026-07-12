# DayFlow Rebrand & Redesign — Design Spec

Date: 2026-07-12
Status: Approved (visual direction), pending implementation plan

## Context

DayFlow is a React 18 + Vite + Tailwind + Supabase daily planner. Technical audit (Phase A) completed separately: fixed a stale `useAuth.js` shadowing the canonical `useAuth.jsx` (broke password reset silently), fixed a duplicate `aria-label` build warning. Build is clean.

This spec covers the visual/UX rebrand (Phases C–ish of the original master prompt), scoped and directed through an interactive brainstorming session with visual mockups. It does not cover accessibility (WCAG) or performance passes — those remain separate, later phases.

## Goals

- Give DayFlow a distinct visual identity (logo, refined palette, confirmed typography) instead of generic SaaS look.
- Remove gamification (XP/levels/achievements) in favor of calm, informational progress signals — replace with a progress ring; keep habit streaks (not game-scored).
- Redesign the highest-traffic surfaces with real structural/layout changes, not just a token reskin: Today/Dashboard, Tasks, Calendar, Habits, Workouts, Routines, and every modal tied to those views.
- Explicit, distinct mobile layouts for all of the above — not breakpoint-shrunk desktop layouts.
- Preserve all existing functionality and data model; this is a UI/UX layer change, not a feature or backend change.

## Non-goals (this pass)

- Goals, Insights, Notes, Focus, Balance, Bookmarks, BrainDump, Ideas, Projects, Weekly Review, Search, Onboarding — get new design tokens applied (colors/type/shadow/radius) but keep their current layouts. Layout redesign for these is a separate future spec (Phase C2).
- Accessibility audit (Phase D) and performance optimization (Phase E) — separate specs, come after this lands.
- No backend/schema changes. No new dependencies unless explicitly noted below.

## Visual Identity

**Logo:** icon + wordmark. Icon is an abstract arc/flow motif (a curved stroke suggesting motion through a day) — usable standalone as favicon, PWA icon (`icon-192.png`/`icon-512.png`), and avatar fallback. Wordmark: "DayFlow" in Outfit, accent color applied to "flow". Deliverable: SVG source + exported PNG icon sizes replacing `public/favicon.svg`, `public/icon-192.png`, `public/icon-512.png`.

**Color:** keep the forest-green accent family across all three themes (Light/Dark/Forest) — do not introduce a new hue. Refine the exact accent values per theme for better contrast and a less "default green" feel. Exact hex values to be finalized during implementation against WCAG AA contrast checks (deferred a11y pass will re-verify, but don't regress contrast now).

**Typography:** keep the existing pairing — Cormorant Garamond (serif, headlines/greetings) + Outfit (sans, UI text, labels, data). No font migration.

**Progress metric:** replace XP/level display with a progress ring (tasks done / planned) as the hero visual on Today view; reused anywhere a completion metric currently shows XP/level (Insights summary, dashboard header).

## Design tokens (src/index.css, tailwind.config.js)

- Keep the existing CSS-variable architecture (`--bg`, `--accent`, `--text`, etc. per `[data-theme]`) — it's sound, don't replace it.
- Refine, don't replace: spacing scale, radius scale, shadow scale stay as the base system but get tuned — larger radii on hero/bento elements, more generous padding on primary cards, clearer visual weight difference between hero/standard/compact card tiers.
- Surface style: soft elevation (shadow, no border) stays the default card treatment app-wide.
- Motion: GSAP (already a dependency) used more — card entrance stagger on bento grid, reorder transitions when widgets are pinned/reordered, ring fill animation on task completion, run-mode step transitions (Routines). Keep subtle/professional, not playful — no bounce/confetti-style effects added beyond what already exists for completion (existing `Confetti.jsx` kept for task/goal completion, decoupled from the XP system specifically, not from completion events generally).

## Gamification removal

Remove entirely:
- `src/hooks/useXP.js`
- `src/components/ui/XPBadge.jsx`
- `src/hooks/useAchievements.js`
- `src/components/insights/AchievementsView.jsx` (and its route/nav entry)
- XP-tied paths in `src/components/ui/StreakCelebration.jsx` (keep the component if it also serves non-XP streak celebrations — audit at implementation time; if XP-only, remove the file)

Keep, restyle only:
- `src/components/habits/HabitRow.jsx` → replaced by new habit-card component (see Habits section) but streak data/logic (`useHabits.js` streak calc) is unchanged
- `src/components/insights/StreakBoard.jsx`, `SmartStreakBoard.jsx` — restyle to new tokens
- `src/components/ui/Confetti.jsx` — kept for completion feedback generally

New:
- `src/components/ui/ProgressRing.jsx` (note: `src/components/today/ProgressRing.jsx` already exists — audit whether to extend it into a shared component or keep Today-specific and add a generic one; avoid a second `useAuth.js`-style shadow/duplication hazard)

## View-by-view redesign

### Today / Dashboard shell

- **Layout:** bento-grid dashboard replaces the current linear widget stack. Hero cell (largest — e.g. 2×2 or full-width) = focus task / next-up. Surrounding cells sized by importance and by the existing pin/hide widget-customizer system (`useWidgetPreferences.js`, `WidgetCustomizer.jsx`) — pinned widgets get larger cells, hidden widgets are omitted, not collapsed-empty.
- Card size tiers: hero (2×2 or full-width), standard (1×1), compact (1×0.5, e.g. weather/streak strip).
- **Nav shell:** keep SideNav + TopBar + BottomNav structural roles as-is (not moving to icon-only rail) — restyle to new tokens only.
- **Mobile:** grid collapses to a single priority-ordered column (hero card first); bento layout applies at tablet width and up only. BottomNav unchanged structurally.

### Tasks

- **Layout:** grouped by time bucket — Overdue / Today / Upcoming / Someday sections, each with its own header. Left accent stripe on each task card signals urgency/priority color.
- **Task detail/edit modal — desktop:** two-column. Left = main content (title, notes, subtasks). Right = metadata rail (priority, category, due date, recurrence).
- **Task detail/edit modal — mobile:** full-screen, tabbed — "Details" tab (title/notes/metadata) and "Subtasks" tab, instead of one long scroll or the desktop two-column split.

### Habits

- **Layout:** individual habit cards, not a shared weekly-grid row. Each card shows a small streak-strip (last 7 days) inline. Replaces `HabitRow.jsx`'s row-in-shared-grid approach; `HabitCalendar.jsx` (monthly heatmap) stays as a secondary/detail view, not the primary list.
- **Add/Edit habit modal:** two-step wizard. Step 1 = basics (name, icon, frequency). Step 2 = advanced/optional (rules via `HabitRulesPanel.jsx`, reminders, pairing via `HabitPairingSuggestion.jsx`). Progress dots at top of modal.

### Workouts

- **Layout:** weekly fitness rings (one ring per day of the current week, fill state = done/partial/rest, Apple-Fitness-style) as the hero element. Tapping a ring expands that day's session card below (exercise/duration summary) inline.
- **Log/edit workout modal:** template-picker-first. Opens to a list of recent/recurring routines ("Push Day — last: Mon") to repeat with one tap (pre-fills exercises), with "blank session" as an explicit fallback option — not the default.

### Routines

- **Layout:** routine cards (name + step count/preview) in a list. Tapping a routine opens full-screen distraction-free "run mode" — one step at a time, large text, tap/swipe to advance through the sequence. This is new interaction surface, not just styling — needs its own component (`RoutineRunMode.jsx` or similar).
- **Routine editor modal:** numbered step-builder cards. Each step is its own small card (title, duration, optional note/reminder), numbered; reorder via up/down controls (not drag-and-drop).

### Calendar

- **Layout:** month grid + selected-day detail panel. Compact month grid (with per-day task-density indicator), selected day's tasks/events shown in a side detail panel without navigating away. `TimeBlockView.jsx` (time-block planner) role in this layout to be confirmed at implementation time — likely accessible from the detail panel or as a per-day drill-in, not replaced.

## Mobile scope

Every view/modal above gets an explicit mobile layout decision (not just a squeezed desktop layout):
- Today/Dashboard: bento → single priority column
- Tasks modal: two-column desktop → full-screen tabbed mobile
- Workouts modal: template-picker (same pattern works at both sizes, sheet-style presentation on mobile)
- Habits, Routines, Calendar: layouts specified above are mobile-compatible by construction (card lists, run-mode is already full-screen) — confirm spacing/tap-target sizing at implementation time, no separate structural mockup was needed for these.

## Open items for implementation planning

- Exact hex refinement of the accent green per theme (do during implementation, verify contrast).
- Whether `ProgressRing.jsx` becomes a single shared component or stays view-specific (avoid hook-duplication-style hazard noted in `memory.md`).
- `StreakCelebration.jsx` — confirm XP-only vs also used for non-XP streak milestones before deciding delete vs edit.
- `TimeBlockView.jsx` placement within the new Calendar layout.
- New dependency check: none anticipated (GSAP already present for added motion; no new icon/logo library needed if hand-built SVG).
