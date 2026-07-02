# Memory — DayFlow v5 session

Last updated: 2026-07-02

## What was built
- Removed reintroduced `src/hooks/useAuth.js` (shadowed useAuth.jsx — breaks password reset; recurring hazard, never recreate)
- Habits: fixed "daily" label overlapping first circle — grid now `minmax(76px,1fr) repeat(7, minmax(1.75rem,2rem))` gap 0.375rem in HabitRow + HabitsView header; freq label truncates; header day letters `w-7 mx-auto`
- Mobile + button moved into BottomNav (center slot, dispatches `dayflow:quickcapture` event); QuickCapture FAB now desktop-only, listens for that event
- Mic removed: VoiceCommandBar unmounted from DashboardPage (component file kept, unused)
- Tasks: new `🔁 Repeating` filter — lists recurring templates, inline days summary, 🔁 badge opens RecurrencePanel (pause/resume, edit days, end date, stop)
- Ideas: restoreIdea + delete undo toast + aria-label (consistency with other views)

## Decisions made
- Repeat management = filter inside TasksView, not separate page
- Voice features deprecated from UI (files remain)

## Current state
- Build clean (0 errors/warnings). Repo main = this state minus session edits; ZIP `DayFlow_v5.zip` delivered is source of truth
- Supabase migration `supabase/migration-recurrence-controls.sql` must be run by user (recur_status, recur_end_date)

## Next session starts with
- Confirm user pushed DayFlow_v5.zip contents to GitHub (prevents regressions like useAuth.js returning)

## Open questions / next priorities (impact order)
1. Push-to-repo discipline — regressions keep reappearing from stale local copies
2. Delete unused voice/ + FeatureTooltip leftovers if voice stays removed
3. Convert 87 onMouseOver inline-hover handlers to CSS classes
4. Per-view code-split audit after voice removal
5. E2E smoke tests (Playwright) for auth + task CRUD


## Session 2026-07-02 (later) — inline hover → CSS classes
- Added hover utility classes to index.css: hover-surface, hover-accent-soft, hover-accent-mid, hover-danger, hover-text, hover-text-muted, hover-text-accent, hover-lift
- Converted 83 inline onMouseOver/onMouseOut handler pairs across 52 files to these classes; 3 complex border-multi hovers dropped (base state unchanged)
- SideNav active-item hover guarded: className conditional so active gradient not overridden
- Only remaining inline hover = src/components/voice/VoiceCommandBar.jsx (unused, pending deletion)
- Build clean. Next priorities unchanged: (1) push to GitHub, (2) delete voice/, (4) Playwright tests, (5) bundle re-audit
