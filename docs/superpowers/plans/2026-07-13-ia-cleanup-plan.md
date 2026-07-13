# App-Wide IA / Feature Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved spec (`docs/superpowers/specs/2026-07-13-ia-cleanup-design.md`) — cut bloat features, consolidate overlapping nav destinations, add a command palette.

**Architecture:** Cuts are deletion + reference-tracing (same pattern as the earlier gamification-removal task in this project). Consolidations are shell/routing changes — underlying hooks/data models for merged views stay separate. The command palette is a new overlay component reusing existing search/capture services.

**Tech Stack:** React 18, Tailwind, existing `classifyCapture` AI service, existing `Modal.jsx` focus-trap pattern.

**Testing approach:** No component-test framework in this repo. Every task verifies via `npm run build` + grep-based reference checks, consistent with every prior phase of this project.

**No git commits.** Skip any commit step, just mark the checkbox done after verifying.

---

## File Structure

New files:
- `src/components/capture/CaptureView.jsx` — consolidated Notes/Ideas/Brain Dump/Bookmarks shell with type-filter tabs
- `src/components/palette/CommandPalette.jsx` — Cmd/Ctrl+K overlay (navigate/capture/search)

Modified files:
- `src/hooks/useDailyScore.js` — remove `gratitude`/`water` scoring inputs, rebalance weights to still total 100
- `src/hooks/useWidgetPreferences.js` — remove `gratitude`/`affirmations`/`water`/`module-challenges` registry entries
- `src/components/today/TodayView.jsx` — remove gratitude/affirmations/water/monthly-letter/challenges widget rendering + prop threading
- `src/pages/DashboardPage.jsx` — remove the 6 cut hooks' instantiation + prop threading; remove old `notes`/`ideas`/`braindump`/`bookmarks`/`balance`/`challenges` route branches, add `capture` branch
- `src/components/dashboard/SideNav.jsx` / `MobileDrawer.jsx` / `TopBar.jsx` / `useNavConfig.js` — remove cut/merged nav entries, add `Capture`
- `src/components/tasks/TasksView.jsx` — add `Someday`/`Templates`/`Repeating` filter chips
- `src/components/layouts/DashboardLayout.jsx` — global `Cmd/Ctrl+K` listener opening `CommandPalette`

Deleted files:
- `src/hooks/useGratitude.js`, `src/components/gratitude/GratitudeLog.jsx`
- `src/hooks/useAffirmations.js`, `src/components/affirmations/AffirmationsCard.jsx`
- `src/hooks/useMonthlyLetter.js`, `src/components/monthly/MonthlyLetter.jsx`
- `src/hooks/useWater.js`, `src/components/water/WaterTracker.jsx`
- `src/components/balance/BalanceView.jsx`, `BalanceWheel.jsx`, `src/hooks/useBalanceWheel.js`
- `src/components/challenges/ChallengesView.jsx`, `src/hooks/useChallenges.js`, `src/components/today/modules/ChallengesWidget.jsx`
- `src/components/voice/VoiceCommandBar.jsx`

---

## Task 1: Delete Gratitude + Affirmations (Today-view widgets)

**Files:**
- Delete: `src/hooks/useGratitude.js`, `src/components/gratitude/GratitudeLog.jsx`
- Delete: `src/hooks/useAffirmations.js`, `src/components/affirmations/AffirmationsCard.jsx`
- Modify: any file importing the above

- [ ] **Step 1: Find every reference**

Run: `grep -rln "useGratitude\|GratitudeLog\|useAffirmations\|AffirmationsCard" src --include="*.jsx" --include="*.js"`

- [ ] **Step 2: Remove `WIDGET_REGISTRY` entries**

In `src/hooks/useWidgetPreferences.js`, remove the `{ id: 'gratitude', ... }` and `{ id: 'affirmations', ... }` entries from the array.

- [ ] **Step 3: Remove rendering + prop threading in `TodayView.jsx`**

In `src/components/today/TodayView.jsx`'s `WidgetContent` switch, remove the `case 'gratitude': return <GratitudeLog gratitude={gratitude} />` and `case 'affirmations': return <AffirmationsCard affirmations={affirmations} />` branches (and their imports). Remove `gratitude`/`affirmations` from `TodayView`'s prop list and from the `widgetProps` object it builds. Also check for any *direct* (non-widget-registry) render of these — the spec noted `MonthlyLetter` is rendered directly rather than via the registry; confirm `GratitudeLog`/`AffirmationsCard` are NOT also directly rendered somewhere in addition to their registry entries (read the file to confirm, don't assume).

- [ ] **Step 4: Remove hook instantiation + prop threading in `DashboardPage.jsx`**

Remove `const gratitude = useGratitude()` and `const affirmations = useAffirmations()`, and remove `gratitude={gratitude}` / `affirmations={affirmations}` from every component they're currently passed to (`<TodayView .../>` and, per the earlier grep in Task 2 of this same plan, `useDailyScore({ ..., gratitude })` — leave that one alone here, it's handled in Task 2 below; just remove the `TodayView` prop for now if `useDailyScore` still needs the hook instance temporarily).

- [ ] **Step 5: Delete the 4 files**

```bash
rm src/hooks/useGratitude.js src/components/gratitude/GratitudeLog.jsx src/hooks/useAffirmations.js src/components/affirmations/AffirmationsCard.jsx
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: `✓ built`, no unresolved-import errors. (Task 2 below removes the `useDailyScore` dependency on `gratitude` — if the build fails here because `useGratitude` is gone but `DashboardPage.jsx` still passes `gratitude` into `useDailyScore`, that's expected; fix by removing that specific `gratitude` reference in `useDailyScore(...)`'s call site now, since the hook itself no longer exists to instantiate.)

- [ ] **Step 7: Mark done (no commit)**

---

## Task 2: Rebalance `useDailyScore.js` (drop gratitude + water scoring)

**Files:**
- Modify: `src/hooks/useDailyScore.js`
- Modify: `src/pages/DashboardPage.jsx` (the `useDailyScore({...})` call site)

- [ ] **Step 1: Rewrite the scoring formula**

Current weights: tasks 35, habits 30, mood 15, gratitude 10, water 10 (=100). Removing gratitude+water (20 points) — redistribute proportionally so the max stays 100: tasks 35→44, habits 30→37, mood 15→19 (44+37+19=100, closest whole-number redistribution preserving the original 35:30:15 ratio scaled up by 100/80=1.25).

```js
// src/hooks/useDailyScore.js
import { useMemo }    from 'react'
import { getTodayKey } from '../utils/dateUtils'

export function useDailyScore({ tasks, habits, mood }) {
  const today = getTodayKey()

  const todayScore = useMemo(() => {
    const dayTasks   = (tasks?.tasks || []).filter(t => t.date === today)
    const done       = dayTasks.filter(t => t.completed).length
    const taskScore  = dayTasks.length > 0 ? (done / dayTasks.length) * 44 : 0
    const habitPct   = (habits?.getTodayCompletion?.() || 0) / 100
    const habitScore = habitPct * 37
    const hasMood    = !!mood?.getMoodForDate?.(today)
    const moodScore  = hasMood ? 19 : 0
    const total      = Math.round(taskScore + habitScore + moodScore)
    const grade      = total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : total >= 50 ? 'D' : 'F'
    const message    =
      total >= 90 ? 'Perfect day. You crushed it! 🏆'  :
      total >= 80 ? 'Excellent work. Keep it up! 🔥'    :
      total >= 70 ? 'Solid day. Good momentum. 💪'      :
      total >= 60 ? 'Decent day. Room to grow. 🌱'      :
      total >= 50 ? 'Tough day. Tomorrow is fresh. 🌅'  :
      total > 0   ? 'Rough one. Show up tomorrow. ❤️'   :
                    'Nothing logged yet. Start your day! ☀️'
    return {
      total, grade, message,
      breakdown: {
        tasks:  Math.round(taskScore),
        habits: Math.round(habitScore),
        mood:   Math.round(moodScore),
      },
      meta: { tasksScheduled: dayTasks.length, tasksDone: done },
    }
  }, [tasks?.tasks, habits?.log, mood?.moods, today])

  const calculate = (dateKey = today) => {
    if (dateKey === today) return todayScore
    const dayTasks   = (tasks?.tasks || []).filter(t => t.date === dateKey)
    const done       = dayTasks.filter(t => t.completed).length
    const taskScore  = dayTasks.length > 0 ? (done / dayTasks.length) * 44 : 0
    const habitPct   = (habits?.getTodayCompletion?.() || 0) / 100
    const total      = Math.round(taskScore + habitPct * 37)
    const grade      = total >= 90 ? 'A+' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : total >= 50 ? 'D' : 'F'
    return { total, grade, message: '', breakdown: {}, meta: { tasksScheduled: dayTasks.length, tasksDone: done } }
  }

  return { calculate, ...todayScore }
}
```

- [ ] **Step 2: Update the call site in `DashboardPage.jsx`**

Find `useDailyScore({ tasks, habits, mood, gratitude, water })` and change to `useDailyScore({ tasks, habits, mood })`.

- [ ] **Step 3: Check `DailyScore.jsx`/`DailySummaryCard.jsx` for breakdown rendering**

Run: `grep -rn "breakdown\.\(gratitude\|water\)" src/components`. If either component renders `scoreData.breakdown.gratitude` or `.water` directly, remove those specific display lines (the breakdown object no longer has those keys — leaving the JSX in place would just silently render `undefined`, which isn't a crash but is stale UI to clean up).

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Mark done (no commit)**

---

## Task 3: Delete Monthly Letter + Water Tracker

**Files:**
- Delete: `src/hooks/useMonthlyLetter.js`, `src/components/monthly/MonthlyLetter.jsx`
- Delete: `src/hooks/useWater.js`, `src/components/water/WaterTracker.jsx`
- Modify: any file importing the above

- [ ] **Step 1: Find every reference**

Run: `grep -rln "useMonthlyLetter\|MonthlyLetter\|useWater\|WaterTracker" src --include="*.jsx" --include="*.js"`

- [ ] **Step 2: Remove `MonthlyLetter`'s direct render in `TodayView.jsx`**

`MonthlyLetter` is rendered directly (not via `WIDGET_REGISTRY`) — find and remove the `<MonthlyLetter monthlyLetter={monthlyLetter} />` line and its import, plus the `monthlyLetter` prop from `TodayView`'s prop list.

- [ ] **Step 3: Remove `water`'s `WIDGET_REGISTRY` entry**

In `src/hooks/useWidgetPreferences.js`, remove the `{ id: 'water', ... }` entry. In `TodayView.jsx`'s `WidgetContent` switch, remove the `case 'water': return <WaterTracker water={water} />` branch and its import, and remove `water` from the prop list/`widgetProps`.

- [ ] **Step 4: Remove hook instantiation in `DashboardPage.jsx`**

Remove `const monthlyLetter = useMonthlyLetter()` and `const water = useWater()`, and every prop pass-through of `monthlyLetter={monthlyLetter}`/`water={water}` (should only remain, if anywhere, in `InsightsView.jsx`'s prop list per the earlier-seen `DashboardPage.jsx` render line for `insights` — check and remove there too if present).

- [ ] **Step 5: Delete the 4 files**

```bash
rm src/hooks/useMonthlyLetter.js src/components/monthly/MonthlyLetter.jsx src/hooks/useWater.js src/components/water/WaterTracker.jsx
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: `✓ built`, no unresolved-import errors.

- [ ] **Step 7: Mark done (no commit)**

---

## Task 4: Delete Balance + Challenges (routed nav destinations)

**Files:**
- Delete: `src/components/balance/BalanceView.jsx`, `BalanceWheel.jsx`, `src/hooks/useBalanceWheel.js`
- Delete: `src/components/challenges/ChallengesView.jsx`, `src/hooks/useChallenges.js`, `src/components/today/modules/ChallengesWidget.jsx`
- Modify: `src/pages/DashboardPage.jsx`, `src/components/dashboard/SideNav.jsx`, `src/components/dashboard/MobileDrawer.jsx`, `src/components/dashboard/TopBar.jsx`, `src/hooks/useNavConfig.js`, `src/components/today/TodayView.jsx`

- [ ] **Step 1: Find every reference**

Run: `grep -rln "BalanceView\|BalanceWheel\|useBalanceWheel\|ChallengesView\|useChallenges\|ChallengesWidget" src --include="*.jsx" --include="*.js"`

- [ ] **Step 2: Remove nav entries**

In `src/components/dashboard/SideNav.jsx`, remove `{ id: 'balance', ... }` from the "Reflect" section and `{ id: 'challenges', ... }` from the "Build" section. Check `MobileDrawer.jsx` for a parallel nav list and remove the same entries there. In `src/hooks/useNavConfig.js`'s `ALL_MODULES` array, remove the `challenges` entry (and `balance` if present — the earlier grep of this file didn't show a `balance` entry, confirm before removing). In `src/components/dashboard/TopBar.jsx`'s tab-title mapping object, remove the `balance`/`challenges` key-value pairs.

- [ ] **Step 3: Remove route branches in `DashboardPage.jsx`**

Remove the `{activeTab === 'balance' && <BalanceView .../>}` and `{activeTab === 'challenges' && <ChallengesView .../>}` render lines and their lazy imports. Remove `const challenges = useChallenges()` / any `useBalanceWheel()` instantiation, and remove `challenges={challenges}` from `TodayView`'s and `InsightsView`'s prop lists (per the earlier-seen `DashboardPage.jsx` render lines including `challenges` in both).

- [ ] **Step 4: Remove `module-challenges` widget from Today**

In `src/hooks/useWidgetPreferences.js`, remove the `{ id: 'module-challenges', ... }` entry. In `TodayView.jsx`'s `WidgetContent` switch, remove the `case 'module-challenges': return <ChallengesWidget .../>` branch and its import.

- [ ] **Step 5: Delete the 6 files**

```bash
rm src/components/balance/BalanceView.jsx src/components/balance/BalanceWheel.jsx src/hooks/useBalanceWheel.js src/components/challenges/ChallengesView.jsx src/hooks/useChallenges.js src/components/today/modules/ChallengesWidget.jsx
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: `✓ built`, no unresolved-import errors.

- [ ] **Step 7: Mark done (no commit)**

---

## Task 5: Delete `VoiceCommandBar.jsx` (confirmed dead code)

**Files:**
- Delete: `src/components/voice/VoiceCommandBar.jsx`

- [ ] **Step 1: Confirm zero importers**

Run: `grep -rln "VoiceCommandBar" src --include="*.jsx" --include="*.js"`
Expected: only the file itself (`src/components/voice/VoiceCommandBar.jsx`) matches — if anything else references it, STOP and report BLOCKED rather than deleting (this would mean the "confirmed dead" premise from the spec is stale).

- [ ] **Step 2: Delete it**

```bash
rm src/components/voice/VoiceCommandBar.jsx
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors. Also confirm `src/components/voice/VoiceJournal.jsx` still exists and is untouched (it's explicitly kept per the spec).

- [ ] **Step 4: Mark done (no commit)**

---

## Task 6: Consolidate Notes/Ideas/Brain Dump/Bookmarks into `CaptureView`

**Files:**
- Create: `src/components/capture/CaptureView.jsx`
- Modify: `src/pages/DashboardPage.jsx`, `src/components/dashboard/SideNav.jsx`, `src/components/dashboard/MobileDrawer.jsx`, `src/components/dashboard/TopBar.jsx`, `src/hooks/useNavConfig.js`

- [ ] **Step 1: Read all 4 existing view files**

Read `src/components/notes/NotesView.jsx`, `src/components/ideas/IdeasView.jsx`, `src/components/braindump/BrainDump.jsx`, `src/components/bookmarks/BookmarksView.jsx` in full. Confirm each is self-contained (owns its own layout/empty-state/add-flow using a hook passed as a prop) rather than depending on route-level state from `DashboardPage.jsx` beyond its own data hook — this determines whether they can be mounted as-is inside tab content or need internal restructuring first.

- [ ] **Step 2: Create `CaptureView`**

```jsx
// src/components/capture/CaptureView.jsx
// Purpose: Single "Capture" destination replacing 4 separate nav entries
//          (Notes/Ideas/Brain Dump/Bookmarks). Each type keeps its own data
//          hook/CRUD — this is a routing/shell consolidation only, not a
//          data-model merge.
import { useState } from 'react'
import NotesView     from '../notes/NotesView'
import IdeasView     from '../ideas/IdeasView'
import BrainDump     from '../braindump/BrainDump'
import BookmarksView from '../bookmarks/BookmarksView'

const TYPES = [
  { id: 'notes',     label: 'Notes',      emoji: '📝' },
  { id: 'ideas',     label: 'Ideas',      emoji: '💡' },
  { id: 'braindump', label: 'Brain Dump', emoji: '🧠' },
  { id: 'bookmarks', label: 'Bookmarks',  emoji: '🔖' },
]

export default function CaptureView({ notes, ideas, bookmarks, onTabChange }) {
  const [type, setType] = useState('notes')

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {TYPES.map(t => (
          <button key={t.id} onClick={() => setType(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all border ${
              type === t.id ? 'bg-ink text-white border-ink' : '[background-color:var(--surface)] [border-color:var(--border)] [color:var(--text-muted)]'
            }`}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {type === 'notes'     && <NotesView notes={notes} />}
      {type === 'ideas'     && <IdeasView ideas={ideas} onTabChange={onTabChange} />}
      {type === 'braindump' && <BrainDump />}
      {type === 'bookmarks' && <BookmarksView bookmarks={bookmarks} />}
    </div>
  )
}
```

Adjust the exact props each view receives to match what you found in Step 1 — the prop names above (`notes`, `ideas`, `bookmarks`, `onTabChange`) are best-effort based on this project's established prop-threading convention (hook instance passed straight through from `DashboardPage.jsx`); correct them if Step 1 reveals different actual prop names. If `BrainDump.jsx` manages its own state internally with no data-hook prop (some capture-type components in this project are self-contained), render it with no props, as shown.

- [ ] **Step 3: Wire into `DashboardPage.jsx`**

Replace the 4 separate `{activeTab === 'notes' && <NotesView .../>}` / `'ideas'` / `'braindump'` / `'bookmarks'` render lines with one:
```jsx
{activeTab === 'capture' && <CaptureView notes={notes} ideas={ideas} bookmarks={bookmarks} onTabChange={handleTabChange} />}
```
Remove the 4 old lazy imports, add one lazy import for `CaptureView`.

- [ ] **Step 4: Update nav entries**

In `src/components/dashboard/SideNav.jsx`'s "Think" section, replace the 4 entries (`notes`/`ideas`/`braindump`/`bookmarks`) with one: `{ id: 'capture', label: 'Capture', emoji: '📥' }`. Same change in `MobileDrawer.jsx` if it has a parallel list. In `useNavConfig.js`'s `ALL_MODULES`, replace `{ id: 'notes', ... }` with `{ id: 'capture', label: 'Capture', emoji: '📥' }` and remove any separate `ideas` entry if one exists there (the earlier grep of this file only showed `notes` and `ideas` as separate entries — confirm and consolidate both into the one `capture` entry). In `TopBar.jsx`'s tab-title mapping, replace the `notes`/`ideas` keys with one `capture: 'Capture'` key (remove `braindump`/`bookmarks` keys too if present there).

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 6: Mark done (no commit)**

---

## Task 7: Fold Someday/Templates/Repeating into `TasksView` filters

**Files:**
- Modify: `src/components/tasks/TasksView.jsx`
- Modify: `src/pages/DashboardPage.jsx`, nav files (only if these currently have separate top-level nav entries — confirm first)

- [ ] **Step 1: Confirm current mount points**

Run: `grep -rn "SomedayList\|TaskTemplates\|RepeatingView" src/components/tasks/TasksView.jsx src/pages/DashboardPage.jsx src/components/dashboard/SideNav.jsx`

The earlier-seen `TasksView.jsx` code (from this project's rebrand phase) already renders `<TaskTemplates templates={templates} tasks={tasks} />` and `<SomedayList someday={someday} tasks={tasks} />` inline, unconditionally, below the main task-section list (not gated by a filter chip). `RepeatingView.jsx` has its own top-level "Repeating" nav entry (confirmed in `SideNav.jsx`'s "Build" section). Adjust the rest of this task based on what you actually find — if Someday/Templates are already inline-always-visible rather than separate routes, "folding into Tasks" for those two means gating their existing inline render behind new filter chips (so they're not always visible, only when selected) rather than removing a separate nav entry that doesn't exist for them. `Repeating` genuinely needs its nav entry removed and its content moved into `TasksView.jsx`.

- [ ] **Step 2: Add filter chips**

In `TasksView.jsx`, extend the `FILTERS` array (or however the chip list is currently defined — confirmed earlier as `const FILTERS = ['All', 'Today', 'Overdue', 'Pending', 'Done']` from an earlier read of an older version of this file; re-read the CURRENT file since it was restructured into `TaskSection`-based grouping in this project's rebrand phase, and the filter-chip bar may have changed shape) to add `'Someday'`, `'Templates'`, `'Repeating'`.

- [ ] **Step 3: Gate rendering by filter**

Change the always-visible `<TaskTemplates .../>` / `<SomedayList .../>` renders to only show when their filter chip is active:
```jsx
{filter === 'Templates' && <TaskTemplates templates={templates} tasks={tasks} />}
{filter === 'Someday'   && <SomedayList someday={someday} tasks={tasks} />}
{filter === 'Repeating' && <RepeatingView items={/* whatever useRepeatingItems() or equivalent hook TasksView needs — check RepeatingView.jsx's current props and DashboardPage.jsx's current 'repeating' route render for the real hook/prop wiring before writing this */} />}
```
When one of these 3 filters is active, skip rendering the normal `TaskSection` grouped list (Overdue/Today/Upcoming/Done) — these are alternate content modes for the same view, not additive.

- [ ] **Step 4: Remove `Repeating`'s standalone nav entry**

In `src/components/dashboard/SideNav.jsx`'s "Build" section, remove the `{ id: 'repeating', ... }` entry. Remove its route branch and lazy import in `DashboardPage.jsx`. Remove it from `useNavConfig.js`'s `ALL_MODULES` if present there.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 6: Mark done (no commit)**

---

## Task 8: Command palette

**Files:**
- Create: `src/components/palette/CommandPalette.jsx`
- Modify: `src/layouts/DashboardLayout.jsx`

- [ ] **Step 1: Check for keybinding conflicts**

Run: `grep -n "key ===" src/components/keyboard/KeyboardShortcuts.jsx`
Confirmed (from earlier investigation in this session): only `'?'` and `'Escape'` are bound — no existing `Cmd+K`/`Ctrl+K` conflict.

- [ ] **Step 2: Read `Modal.jsx`'s focus-trap pattern**

Read `src/components/ui/Modal.jsx` in full (it has an Escape-handler and Tab-focus-trap from an earlier accessibility phase of this project) — reuse the same pattern rather than reinventing it for the palette.

- [ ] **Step 3: Create `CommandPalette`**

```jsx
// src/components/palette/CommandPalette.jsx
// Purpose: Cmd/Ctrl+K overlay combining navigation, quick capture, and search
//          into one input. Reuses classifyCapture (existing AI service) for
//          capture, and ALL_MODULES (existing nav config) for navigation.
import { useState, useEffect, useRef } from 'react'
import { ALL_MODULES } from '../../hooks/useNavConfig'
import { classifyCapture } from '../../services/captureClassifier'

export default function CommandPalette({ isOpen, onClose, onNavigate, onCapture }) {
  const [query, setQuery]     = useState('')
  const [capturing, setCapturing] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const matches = ALL_MODULES.filter(m =>
    m.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleCapture = async () => {
    if (!query.trim()) return
    setCapturing(true)
    const result = await classifyCapture(query.trim())
    onCapture(result)
    setCapturing(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4"
      style={{ backgroundColor: 'var(--overlay)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-modal)' }}
        onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && matches.length === 0) handleCapture() }}
          placeholder="Jump to a view, or type to capture..."
          className="w-full px-5 py-4 text-base outline-none bg-transparent border-b"
          style={{ color: 'var(--text)', borderColor: 'var(--border-soft)' }}
          aria-label="Command palette"
        />
        <div className="max-h-80 overflow-y-auto">
          {matches.map(m => (
            <button key={m.id} onClick={() => { onNavigate(m.id); onClose() }}
              className="w-full text-left px-5 py-3 text-sm flex items-center gap-2 hover-surface"
              style={{ color: 'var(--text)' }}>
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
          {matches.length === 0 && query.trim() && (
            <button onClick={handleCapture} disabled={capturing}
              className="w-full text-left px-5 py-3 text-sm disabled:opacity-50"
              style={{ color: 'var(--accent)' }}>
              {capturing ? 'Capturing…' : `✨ Capture "${query.trim()}"`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Wire the global keybinding into `DashboardLayout.jsx`**

Read `src/layouts/DashboardLayout.jsx` in full first to find where `activeTab`/`onTabChange` state lives (needed for `onNavigate`) and how top-level create-flows are triggered (needed for `onCapture` to actually create something from the classified result — reuse whatever `QuickCapture.jsx` does with a `classifyCapture` result, don't reinvent the routing-by-type logic; if that logic isn't easily extracted from `QuickCapture.jsx`, it's acceptable for `onCapture` to just create a task from `result.fields` as a minimal correct behavior, matching `QuickTaskBar.jsx`'s simpler fallback approach, and note this as a scope-narrowing decision in your report).

Add:
```jsx
import { useState, useEffect } from 'react'
import CommandPalette from '../components/palette/CommandPalette'
// ...
const [paletteOpen, setPaletteOpen] = useState(false)

useEffect(() => {
  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setPaletteOpen(true)
    }
  }
  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}, [])
```

Render `<CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={/* the real tab-change handler found above */} onCapture={/* task-creation call, per the note above */} />` once, at the layout's top level (outside the per-tab content so it overlays everything).

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 6: Mark done (no commit)**

---

## Task 9: Final cross-cutting verification

**Files:** none (verification only)

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: `✓ built`, zero errors, zero new warnings.

- [ ] **Step 2: Confirm every cut feature has zero remaining references**

Run: `grep -rln "useGratitude\|GratitudeLog\|useAffirmations\|AffirmationsCard\|useMonthlyLetter\|MonthlyLetter\|useWater\|WaterTracker\|BalanceView\|BalanceWheel\|useBalanceWheel\|ChallengesView\|useChallenges\|ChallengesWidget\|VoiceCommandBar" src`
Expected: zero matches (VoiceJournal is a distinct name and won't match these patterns).

- [ ] **Step 3: Confirm nav consistency**

Run: `grep -n "id:" src/hooks/useNavConfig.js` and manually confirm the list no longer includes any cut/merged ids (`gratitude`, `affirmations`, `water`, `balance`, `challenges`, `notes`, `ideas` as separate entries, `repeating`) and does include `capture`.

- [ ] **Step 4: Confirm `useDailyScore` weights still sum to 100**

Run: `grep -n "\* 44\|\* 37\|\* 19" src/hooks/useDailyScore.js` — confirm all three appear (44+37+19=100).

- [ ] **Step 5: Mark plan complete (no commit — user commits manually)**
