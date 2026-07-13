# App-Wide IA / Feature Cleanup — Design Spec

Date: 2026-07-13
Status: Approved, pending implementation plan
Related: independent of [2026-07-13-task-reminders-design.md](./2026-07-13-task-reminders-design.md) — separate subsystem, can ship in either order.

## Context

DayFlow's nav has grown to ~20 destinations across 4 SideNav sections (Plan/Build/Think/Reflect) plus Today-view widgets, several of which overlap conceptually (4 separate "capture a thought" views, 4 separate "reflect on life" surfaces) or read as gamification-adjacent scope creep inconsistent with the "calm, does fewer things well" positioning established in the earlier visual rebrand.

## Goal

Cut genuine bloat, consolidate overlapping views into fewer nav destinations without losing underlying functionality, and add one high-leverage feature (command palette) that ties existing capabilities (search, capture, navigation) together.

## Cuts

Delete entirely — files, hooks, nav entries, and all prop-threading:
- `src/hooks/useGratitude.js`, `src/components/gratitude/GratitudeLog.jsx`, its `WIDGET_REGISTRY` entry (`id: 'gratitude'`) in `useWidgetPreferences.js`, and the `gratitude` prop threading through `DashboardPage.jsx` → `TodayView.jsx` → `WidgetContent`.
- `src/hooks/useAffirmations.js`, `src/components/affirmations/AffirmationsCard.jsx`, its `WIDGET_REGISTRY` entry (`id: 'affirmations'`), and prop threading.
- `src/hooks/useMonthlyLetter.js`, `src/components/monthly/MonthlyLetter.jsx`, and its direct render in `TodayView.jsx` (it's rendered directly, not via `WIDGET_REGISTRY` — confirm at implementation time and remove the render call + prop threading accordingly).
- `src/hooks/useWater.js`, `src/components/water/WaterTracker.jsx`, its `WIDGET_REGISTRY` entry (`id: 'water'`), and prop threading. **Also**: `src/hooks/useDailyScore.js` currently takes `water` as a scoring input — remove that input and adjust the score formula so removing water tracking doesn't silently zero out or break the daily score calculation for existing users.
- `src/components/balance/BalanceView.jsx`, `BalanceWheel.jsx`, `src/hooks/useBalanceWheel.js`, and its "Reflect" section entry in `SideNav.jsx`/`MobileDrawer.jsx`/`useNavConfig.js` (if listed there)/`TopBar.jsx`'s title-mapping object.
- `src/components/challenges/ChallengesView.jsx`, `src/hooks/useChallenges.js`, and its "Build" section entry in the same nav files above. Also check `TodayView.jsx`'s `ChallengesWidget` module (`module-challenges` in `WIDGET_REGISTRY`) — remove that too.
- `src/components/voice/VoiceCommandBar.jsx` — confirmed zero importers (dead code), delete outright.

Explicitly kept: `src/components/voice/VoiceJournal.jsx` — confirmed live, rendered in `InsightsView.jsx`, not part of this cleanup.

## Consolidation

### "Think" section → single Capture view

- New `src/components/capture/CaptureView.jsx` becomes the routed component for a single `capture` tab, replacing 4 separate routes (`notes`, `ideas`, `braindump`, `bookmarks`).
- Internally: type-filter tabs (Notes / Ideas / Brain Dump / Bookmarks) that render the *existing* `NotesView`/`IdeasView`/`BrainDump`/`BookmarksView` bodies (or their internal list/card-rendering pieces, refactored into presentational sub-components if those files currently couple routing and rendering) — this is a shell/routing consolidation. The 4 underlying hooks (`useNotes`, `useIdeas`, `useBookmarks`, and whatever `BrainDump` uses) are **not** merged into one data model — each keeps its own storage/CRUD, `CaptureView` just decides which one's UI to show based on the active filter tab.
- `SideNav.jsx`'s "Think" section collapses from 4 entries to 1 (`Capture`). `useNavConfig.js`'s `ALL_MODULES` list updated to match (remove `notes`/`ideas` as separate customizable-nav options if they're listed there, add `capture`). `TopBar.jsx`'s tab-title mapping updated.
- Universal AI capture (`classifyCapture`, already wired into `QuickCapture.jsx`/`QuickTaskBar.jsx`) is a natural fit for a "+" button inside `CaptureView` that routes a typed sentence to the right sub-type — reuse, don't rebuild.

### Someday / Templates / Repeating → Tasks filters

- `TasksView.jsx`'s existing filter-chip bar (`Overdue`/`Today`/`Upcoming`/`Done`, from the earlier rebrand) gains three more chips: `Someday`, `Templates`, `Repeating`.
- Selecting `Someday` renders `SomedayList.jsx`'s existing content in place of the normal task-section list (reuse the component, change where it's mounted). Same pattern for `Templates` → `TaskTemplates.jsx` and `Repeating` → `RepeatingView.jsx`'s content.
- `SideNav.jsx`'s "Build" section loses its "Repeating" entry. If Someday/Templates currently have their own nav entries anywhere (confirm at implementation time — they may currently only be reachable as sections *within* `TasksView.jsx` already, per the existing code seen earlier in this session, in which case this consolidation may already be partially done and this step reduces to "convert existing inline sections into filter-chip-gated views" rather than "remove separate nav entries").

## Add: Command palette

- New `src/components/palette/CommandPalette.jsx` — a `Cmd/Ctrl+K`-triggered full-screen overlay (similar treatment to `Modal.jsx`'s focus-trap/Escape pattern, reused).
- Three capabilities in one input:
  1. **Navigate**: fuzzy-match against remaining nav destinations (`ALL_MODULES` list), Enter jumps to that tab.
  2. **Capture**: typing a plain sentence and pressing a "Capture" action routes it through `classifyCapture` (existing AI service), same behavior as `QuickCapture.jsx`.
  3. **Search**: reuses `SearchView.jsx`'s existing search logic/results rendering for matching against tasks/notes/ideas/etc, shown inline in the palette rather than requiring a separate Search nav destination (note: `SearchView` itself may become foldable into the palette entirely, or may stay as a fallback full-page view — decide at implementation time based on how tightly coupled its current search logic is to its own routing).
- Global keybinding attached once at `DashboardLayout.jsx` level (`keydown` listener for `Cmd+K`/`Ctrl+K`, opens the palette; `Escape` closes it — palette should not fight with any existing global shortcuts, check `KeyboardShortcuts.jsx` first for conflicts).

## Non-goals

- No data-model changes to the 4 capture types being consolidated under `CaptureView` — this is a routing/shell change only.
- No changes to `useDailyScore.js`'s scoring philosophy beyond removing the `water` input — not a broader scoring-system redesign.
- Global undo stack, full offline-conflict audit, and export/import round-trip are explicitly deferred to a future pass, not part of this spec.

## Open items for implementation planning

- Confirm exact current location of Someday/Templates (nav entries vs already-inline in TasksView) before writing tasks — the plan should adapt based on what's actually found, not assume.
- Confirm whether `SearchView.jsx`'s logic is portable into the palette directly or needs extraction into a shared search-service function first.
- Confirm `KeyboardShortcuts.jsx` doesn't already bind `Cmd+K`/`Ctrl+K` to something else before wiring the palette's global listener.
