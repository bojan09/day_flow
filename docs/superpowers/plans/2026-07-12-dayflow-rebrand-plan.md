# DayFlow Visual Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved visual rebrand spec (`docs/superpowers/specs/2026-07-12-dayflow-rebrand-design.md`) — refined design tokens, real logo, gamification removal, and structural redesign of Today/Tasks/Habits/Workouts/Routines/Calendar (desktop + mobile), each with their modals.

**Architecture:** No new dependencies, no schema changes. All CSS-variable/token changes stay in `src/index.css` + `tailwind.config.js`. Each view keeps its existing data hook (`useTasks`, `useHabits`, `useWorkouts`, `useRoutines`) untouched — only presentation components change. GSAP (already a dependency) used for the new motion (bento entrance stagger, ring fill, run-mode transitions).

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3 + CSS variables, GSAP 3, date-fns 3.

**Testing approach:** This repo has no component-test infrastructure (no vitest/RTL in `package.json`) and the spec is pure UI/layout — there's no meaningful pure logic to unit-test in these components. Each task's "test" step is: `npm run build` succeeds with no new warnings, then a manual visual check via the dev server (`npm run dev`), described per task. Do not add a testing framework — out of scope for this spec.

**No git commits.** User manages all commits manually — do NOT run `git add`/`git commit` at any step in this plan, even though the step template below shows a commit step. Skip that step entirely; just mark the checkbox done after verifying.

---

## File Structure

New files:
- `public/logo-icon.svg` — standalone arc/flow icon (replaces favicon/app-icon source)
- `src/components/ui/Logo.jsx` — icon + wordmark lockup component (used in SideNav, AuthPage, WelcomePage)
- `src/components/today/BentoGrid.jsx` — grid container + cell-sizing logic for Today view
- `src/components/tasks/TaskSection.jsx` — one time-bucket section (Overdue/Today/Upcoming/Someday) with header + task rows
- `src/components/tasks/TaskModalDesktop.jsx` — two-column desktop task detail layout
- `src/components/tasks/TaskModalMobile.jsx` — full-screen tabbed mobile task detail layout
- `src/components/habits/HabitCard.jsx` — single habit card w/ streak-strip (replaces per-row grid rendering)
- `src/components/habits/AddHabitWizard.jsx` — two-step wizard (replaces old single-step `AddHabitModal.jsx` body)
- `src/components/workouts/WeeklyRings.jsx` — 7-day ring row, tap-to-expand
- `src/components/workouts/WorkoutTemplatePicker.jsx` — template-first picker shown when opening the log modal
- `src/components/routines/RoutineRunMode.jsx` — full-screen step-by-step execution view
- `src/components/routines/StepBuilderCard.jsx` — numbered step editor card (used in `RoutineEditor.jsx`)
- `src/components/calendar/DayDetailPanel.jsx` — side panel showing selected day's tasks/events

Modified files:
- `src/index.css` — token refinement (palette values, radius/shadow scale tuning)
- `public/manifest.json`, `index.html` — point at new logo assets
- `src/components/today/TodayView.jsx` — switch widget list from stacked `space-y-3` to `BentoGrid`
- `src/components/today/ProgressRing.jsx` — restyle as bento hero cell
- `src/components/tasks/TasksView.jsx` — replace flat filtered list with `TaskSection` grouping
- `src/components/tasks/TaskDetail.jsx` — render `TaskModalDesktop` or `TaskModalMobile` based on viewport
- `src/components/habits/HabitsView.jsx` — render `HabitCard` list instead of `HabitRow` grid
- `src/components/habits/AddHabitModal.jsx` — wrap `AddHabitWizard`
- `src/components/workouts/WorkoutsView.jsx` — add `WeeklyRings` hero, restyle session list
- `src/components/workouts/WorkoutForm.jsx` — add `WorkoutTemplatePicker` as first screen
- `src/components/routines/RoutinesView.jsx` — wire "Run" button to `RoutineRunMode`
- `src/components/routines/RoutineEditor.jsx` — replace step list rendering with `StepBuilderCard`
- `src/components/calendar/CalendarView.jsx` — add `DayDetailPanel` alongside grid

Deleted files (gamification removal):
- `src/hooks/useXP.js`
- `src/components/ui/XPBadge.jsx`
- `src/hooks/useAchievements.js`
- `src/components/insights/AchievementsView.jsx`

---

## Task 1: Design token refinement

**Files:**
- Modify: `src/index.css:9-116`

- [ ] **Step 1: Deepen the accent green per theme**

In `src/index.css`, update the three theme blocks (keep every other variable in each block unchanged — only these three lines per theme):

```css
/* Light theme block */
--accent:         #2F5C3E;
--accent-light:   #EAF2E8;
--accent-mid:     #9BC093;

/* Dark theme block */
--accent:         #6BBF83;
--accent-light:   #17301F;
--accent-mid:     #2C5A3C;

/* Forest theme block */
--accent:         #234A30;
--accent-light:   #D0EAD0;
--accent-mid:     #7EB57E;
```

- [ ] **Step 2: Widen the radius scale for hero/bento elements**

In the theme-independent `:root` block, add one new token after `--radius-2xl`:

```css
--radius-2xl: 24px;
--radius-3xl: 28px;   /* NEW — hero bento cells, run-mode screens */
--radius-full: 9999px;
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: `✓ built` with no new warnings (same as the baseline audit run).

- [ ] **Step 4: Visual check**

Run: `npm run dev`, open the app, cycle all 3 themes via the theme toggle in `TopBar`. Confirm accent color reads clearly against `--bg`/`--surface` in each theme and no existing component looks broken (buttons, badges, active nav items still visible).

- [ ] **Step 5: Mark done (no commit — user commits manually)**

---

## Task 2: Logo — icon + wordmark

**Files:**
- Create: `public/logo-icon.svg`
- Create: `src/components/ui/Logo.jsx`
- Modify: `public/favicon.svg`
- Modify: `index.html:1-30` (check title/favicon link tag)
- Modify: `public/manifest.json`
- Modify: `src/components/dashboard/SideNav.jsx` (swap any existing "DayFlow" text header for `<Logo />`)

- [ ] **Step 1: Create the standalone icon SVG**

```html
<!-- public/logo-icon.svg -->
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="var(--accent, #2F5C3E)"/>
  <path d="M14 40 C 14 24, 28 18, 33 30 C 38 42, 52 36, 52 20"
        fill="none" stroke="#FAFAF8" stroke-width="5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 2: Create the `Logo` component (icon + wordmark lockup)**

```jsx
// src/components/ui/Logo.jsx
// Purpose: DayFlow icon + wordmark lockup, used in SideNav/AuthPage/WelcomePage.
export default function Logo({ size = 28, showWordmark = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="64" height="64" rx="16" style={{ fill: 'var(--accent)' }} />
        <path d="M14 40 C 14 24, 28 18, 33 30 C 38 42, 52 36, 52 20"
              fill="none" stroke="#FAFAF8" strokeWidth="5" strokeLinecap="round" />
      </svg>
      {showWordmark && (
        <span className="font-sans font-semibold text-lg" style={{ color: 'var(--text)' }}>
          Day<span style={{ color: 'var(--accent)' }}>Flow</span>
        </span>
      )}
    </span>
  )
}
```

- [ ] **Step 3: Replace `public/favicon.svg` contents with the icon markup from Step 1** (same file, just the icon, no wrapping needed beyond what's already there structurally — match existing favicon.svg's root `<svg>` attributes if they differ from the snippet above, keep `viewBox="0 0 64 64"`).

- [ ] **Step 4: Update `public/manifest.json`** — confirm `icons` array still points at `icon-192.png`/`icon-512.png` (unchanged paths); regenerate those two PNGs from `logo-icon.svg` at 192×192 and 512×512 using any local SVG-to-PNG conversion available (e.g. `npx sharp-cli` or a browser screenshot at that size) — if no conversion tool is available in this environment, leave the PNGs as-is and flag it as a manual follow-up, do not block the rest of the plan on this.

- [ ] **Step 5: Wire `Logo` into `SideNav.jsx`**

Find the existing header markup in `src/components/dashboard/SideNav.jsx` that renders the "DayFlow" text/brand mark (top of the sidebar). Replace it with:

```jsx
import Logo from '../ui/Logo'
// ...in the render, replace the old brand header element with:
<Logo size={26} />
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 7: Visual check**

`npm run dev` — confirm the logo renders in the sidebar, favicon updates in the browser tab (may need a hard refresh), no layout shift/overflow in the nav header.

- [ ] **Step 8: Mark done (no commit)**

---

## Task 3: Remove gamification (XP/levels/achievements), keep streaks

**Files:**
- Delete: `src/hooks/useXP.js`
- Delete: `src/components/ui/XPBadge.jsx`
- Delete: `src/hooks/useAchievements.js`
- Delete: `src/components/insights/AchievementsView.jsx`
- Modify: any file importing the above (locate via grep in Step 1)

- [ ] **Step 1: Find every reference to the files being deleted**

Run: `grep -rn "useXP\|XPBadge\|useAchievements\|AchievementsView" src --include="*.jsx" --include="*.js"`

This returns every import site. Typical locations to expect: `App.jsx` or `DashboardPage.jsx` (route/nav entry for Achievements), `TodayView.jsx` or `DailySummaryCard.jsx` (XP display), `SideNav.jsx`/`useNavConfig.js` (nav entry).

- [ ] **Step 2: Remove each import and its usage**

For each file found in Step 1: delete the `import` line for the removed module, and delete the JSX/logic that consumed it (e.g. `<XPBadge xp={xp} />`, `xp.getLevelInfo()` calls, the Achievements nav entry/route). If a prop like `xp` was only used for these deleted features, remove it from the component's prop list and from wherever it's passed in (trace one level up if needed — e.g. `TodayView` receiving `xp` from `DashboardPage`).

- [ ] **Step 3: Delete the four files**

```bash
rm src/hooks/useXP.js src/components/ui/XPBadge.jsx src/hooks/useAchievements.js src/components/insights/AchievementsView.jsx
```

- [ ] **Step 4: Verify build has zero unresolved-import errors**

Run: `npm run build`
Expected: `✓ built`, no "Could not resolve" errors. If any appear, they point at a leftover import missed in Step 2 — fix and rebuild.

- [ ] **Step 5: Visual check**

`npm run dev` — navigate the full nav (SideNav + BottomNav on mobile viewport via browser devtools). Confirm no "Achievements" entry remains, no broken/blank XP badge space, no console errors.

- [ ] **Step 6: Mark done (no commit)**

---

## Task 4: Today view → bento grid

**Files:**
- Create: `src/components/today/BentoGrid.jsx`
- Modify: `src/components/today/TodayView.jsx:97-186`
- Modify: `src/components/today/ProgressRing.jsx`

- [ ] **Step 1: Create the `BentoGrid` container**

```jsx
// src/components/today/BentoGrid.jsx
// Purpose: Responsive bento layout for Today view. Pinned widgets get the
//          larger cell; everything else is a standard cell. Mobile collapses
//          to a single column (hero first) via the `md:` grid breakpoint.
export default function BentoGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-min gap-4">
      {children}
    </div>
  )
}

export function BentoCell({ size = 'standard', children }) {
  const spanClass =
    size === 'hero'    ? 'md:col-span-2 md:row-span-2' :
    size === 'compact'  ? 'md:col-span-1' :
    'md:col-span-1'
  return (
    <div
      className={`${spanClass} rounded-3xl overflow-hidden`}
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Wrap the widget list in `TodayView.jsx` with `BentoGrid`**

In `src/components/today/TodayView.jsx`, import the new grid:

```jsx
import BentoGrid, { BentoCell } from './BentoGrid'
```

Replace the `{/* Dynamic widget list */}` block (lines ~136-156) so each `CollapsibleWidget` render is wrapped in a `BentoCell`, sized `'hero'` for the first widget in `orderedIds` and `'standard'` for the rest:

```jsx
{/* Dynamic widget list — bento grid */}
<BentoGrid>
  {orderedIds.map((id, idx) => {
    const meta    = getMeta(id)
    const content = <WidgetContent id={id} {...widgetProps} />
    if (!content) return null

    return (
      <BentoCell key={id} size={idx === 0 ? 'hero' : 'standard'}>
        <CollapsibleWidget
          id={id}
          title={meta.title}
          emoji={meta.emoji}
          defaultOpen={meta.defaultOpen}
          isPinned={widgetPrefs.isPinned(id)}
          onTogglePin={widgetPrefs.togglePin}
          onToggleHide={widgetPrefs.toggleHide}
        >
          {content}
        </CollapsibleWidget>
      </BentoCell>
    )
  })}
</BentoGrid>
```

Leave everything above (WeekStrip, MonthlyLetter, nudges, greeting, morning brief, Customize button) and below (evening widgets, static ProgressRing/DailyScore/EndOfDayReview, WidgetCustomizer) exactly where they are — only the dynamic widget list itself moves into the grid.

- [ ] **Step 3: Restyle `ProgressRing` as a standalone hero card**

Open `src/components/today/ProgressRing.jsx`, read its current root element's className/style. Wrap its existing content (do not change the ring-drawing logic/props) in a card treatment matching the new surface tokens:

```jsx
// At the top of the returned JSX, change the outer wrapper to:
<div className="rounded-3xl p-6" style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
  {/* existing ring SVG + label content unchanged below this line */}
</div>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Visual check — desktop and mobile**

`npm run dev`. At desktop width (>768px): confirm the widget list renders as a 2-column grid with the first widget spanning 2×2. Resize the browser below 768px (or use devtools mobile emulation): confirm it collapses to a single column with the hero widget still first. Confirm pin/hide via the Customize panel still works (pinning changes `orderedIds`, which still drives the grid).

- [ ] **Step 6: Mark done (no commit)**

---

## Task 5: Tasks view → grouped-by-time-bucket list

**Files:**
- Create: `src/components/tasks/TaskSection.jsx`
- Modify: `src/components/tasks/TasksView.jsx:41-208`

- [ ] **Step 1: Create `TaskSection`**

Extract the per-task `<li>` row markup (lines 116-175 of the current `TasksView.jsx`) into a reusable row renderer inside a new section component:

```jsx
// src/components/tasks/TaskSection.jsx
// Purpose: One time-bucket section (Overdue/Today/Upcoming/Someday) — header
//          + its task rows. Row rendering matches the existing TasksView row
//          markup (color dot, checkbox, category badge, priority badge, actions).
import Badge from '../ui/Badge'

const CAT_COLORS = {
  Work:     'bg-blue-100 text-blue-700',
  Personal: '[background-color:var(--accent-light)] [color:var(--accent)]',
  Health:   'bg-emerald-100 text-emerald-700',
  Learning: 'bg-violet-100 text-violet-700',
  Finance:  'bg-amber-100 text-amber-700',
  Other:    '[background-color:var(--bg-secondary)] text-stone-600',
}
const CAT_DOT = {
  Work:     'bg-blue-400',
  Personal: '[background-color:var(--accent)]',
  Health:   'bg-emerald-500',
  Learning: 'bg-violet-500',
  Finance:  'bg-amber-400',
  Other:    '[background-color:var(--border)]',
}
const URGENCY_STRIPE = {
  overdue: '#B5654A',
  today:   'var(--accent)',
  future:  'var(--border)',
}

export default function TaskSection({ title, tasks, urgency, tasksApi, projects, onTabChange, onOpenDetail, onOpenRecur, onDelete }) {
  if (tasks.length === 0) return null
  return (
    <div className="space-y-2">
      <h3 className="font-serif text-base font-semibold px-1" style={{ color: 'var(--text)' }}>{title}</h3>
      <ul className="rounded-2xl overflow-hidden divide-y" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-soft)', boxShadow: 'var(--shadow-card)' }}>
        {tasks.map((t, idx) => (
          <li key={t.id}
            className="flex items-start gap-3 px-5 py-3.5 hover:[background-color:var(--bg-secondary)]/50 transition-colors group cursor-pointer animate-fade-up"
            style={{ animationDelay: `${Math.min(idx * 35, 350)}ms`, animationFillMode: 'both', borderLeft: `3px solid ${URGENCY_STRIPE[urgency]}` }}
            onClick={() => onOpenDetail(t)}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${CAT_DOT[t.category] ?? '[background-color:var(--border)]'}`} />
            <button
              onClick={e => { e.stopPropagation(); tasksApi.toggleTask(t.id) }}
              className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center text-xs transition-all ${
                t.completed ? '[background-color:var(--accent)] [border-color:var(--accent)] text-white' : '[border-color:var(--border)] hover:[border-color:var(--accent-mid)]'
              }`}>
              {t.completed && '✓'}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug line-clamp-2 ${t.completed ? 'line-through [color:var(--text-faint)]' : '[color:var(--text)]'}`}>{t.title}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${CAT_COLORS[t.category] ?? '[background-color:var(--bg-secondary)] text-stone-600'}`}>
                  {t.category}
                </span>
                {t.estimateMins && <span className="text-[11px] [color:var(--text-faint)]">⏱ {t.estimateMins < 60 ? `${t.estimateMins}m` : `${t.estimateMins/60}h`}</span>}
                {t.isRecurring && (
                  <button type="button" aria-label="Manage recurrence"
                    onClick={e => { e.stopPropagation(); onOpenRecur(t) }}
                    className="text-[11px] [color:var(--accent)] hover:opacity-70 transition-opacity">
                    🔁{(t.recurStatus ?? 'active') !== 'active' && <span className="ml-0.5 [color:var(--text-muted)]">paused</span>}
                  </button>
                )}
                {(t.subTasks?.length) > 0 && <span className="text-[11px] [color:var(--text-faint)]">· {t.subTasks.filter(s=>s.done).length}/{t.subTasks.length} sub</span>}
                {t.projectId && projects?.find(p => p.id === t.projectId) && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-faint)' }}>
                    🗂️ {projects.find(p => p.id === t.projectId)?.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5" onClick={e => e.stopPropagation()}>
              <Badge label={t.priority} color={t.priority} />
              <button onClick={() => tasksApi.setFocus(t.id)}
                className={`text-sm p-1 rounded opacity-0 group-hover:opacity-100 transition-all ${t.isFocus ? 'opacity-100 [color:var(--accent)]' : '[color:var(--text-faint)] hover:[color:var(--accent)]'}`}>
                {t.isFocus ? '📌' : '📍'}
              </button>
              {onTabChange && (
                <button onClick={() => onTabChange('timeblock')}
                  className="opacity-0 group-hover:opacity-100 text-[11px] px-1.5 py-0.5 rounded transition-all"
                  style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }} title="Open in Schedule">⏰</button>
              )}
              <button aria-label="Delete task" onClick={() => onDelete(t)}
                className="tap-target opacity-0 group-hover:opacity-100 [color:var(--text-faint)] hover:text-red-400 text-xs p-1 transition-all">✕</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Replace the flat list in `TasksView.jsx` with grouped sections**

In `src/components/tasks/TasksView.jsx`, import `TaskSection`:

```jsx
import TaskSection from './TaskSection'
```

Replace the sort/render logic (the `sorted` computation and the `<Card noPad>...</Card>` block, lines ~57-189) with:

```jsx
const byPriority = (a, b) => {
  const p = { high: 0, medium: 1, low: 2 }
  return (p[a.priority] ?? 1) - (p[b.priority] ?? 1)
}

const overdueTasks  = filtered.filter(t => !t.completed && tasks.isOverdue(t)).sort(byPriority)
const todayTasks    = filtered.filter(t => !t.completed && t.date === todayKey).sort(byPriority)
const upcomingTasks = filtered.filter(t => !t.completed && t.date > todayKey).sort(byPriority)
const doneTasks     = filtered.filter(t => t.completed).sort(byPriority)

const handleDelete = (t) => { tasks.deleteTask(t.id); toast.undo('Task deleted', () => tasks.restoreTask(t)) }

// ...in the return JSX, replace the <Card noPad> block with:
{filtered.length === 0 ? (
  <EmptyState type="tasks" title="Nothing here" subtitle="Add a task using the input above." action="+ New Task" onAction={() => setModal(true)} />
) : (
  <div className="space-y-5">
    <TaskSection title="Overdue"  tasks={overdueTasks}  urgency="overdue" tasksApi={tasks} projects={projects} onTabChange={onTabChange} onOpenDetail={setDetail} onOpenRecur={setRecurTask} onDelete={handleDelete} />
    <TaskSection title="Today"    tasks={todayTasks}    urgency="today"   tasksApi={tasks} projects={projects} onTabChange={onTabChange} onOpenDetail={setDetail} onOpenRecur={setRecurTask} onDelete={handleDelete} />
    <TaskSection title="Upcoming" tasks={upcomingTasks} urgency="future"  tasksApi={tasks} projects={projects} onTabChange={onTabChange} onOpenDetail={setDetail} onOpenRecur={setRecurTask} onDelete={handleDelete} />
    <TaskSection title="Done"     tasks={doneTasks}     urgency="future"  tasksApi={tasks} projects={projects} onTabChange={onTabChange} onOpenDetail={setDetail} onOpenRecur={setRecurTask} onDelete={handleDelete} />
  </div>
)}
```

Keep the existing `filtered` computation (the `FILTERS` chip bar still narrows what feeds into these four buckets), `Card` import can be removed if no longer used elsewhere in the file — check with `grep -n "Card" src/components/tasks/TasksView.jsx` before removing the import.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 4: Visual check**

`npm run dev` — open Tasks tab. Confirm tasks appear under correct section headers (create one overdue, one today, one future test task via the NLP input to check bucketing), toggle/delete/focus/recur actions still work from within a section, empty sections don't render (no empty "Upcoming" header with nothing under it).

- [ ] **Step 5: Mark done (no commit)**

---

## Task 6: Task modal — two-column desktop / tabbed mobile

**Files:**
- Create: `src/components/tasks/TaskModalDesktop.jsx`
- Create: `src/components/tasks/TaskModalMobile.jsx`
- Modify: `src/components/tasks/TaskDetail.jsx`

- [ ] **Step 1: Read the current `TaskDetail.jsx` to identify its field groups**

Run: `grep -n "useState\|<input\|<select\|<textarea" src/components/tasks/TaskDetail.jsx`

This locates the existing fields (title, notes, priority, category, due date, recurrence, subtasks) so Steps 2-3 route the *same* state/handlers into the new layout components rather than re-deriving them.

- [ ] **Step 2: Create a small `useMediaQuery` check inline (no new dependency) and the two layout components**

```jsx
// src/components/tasks/TaskModalDesktop.jsx
// Purpose: Desktop task detail layout — main content left, metadata rail right.
//          Receives already-wired field values/handlers from TaskDetail.jsx —
//          this component only arranges them, it owns no state itself.
export default function TaskModalDesktop({ mainContent, metadataRail }) {
  return (
    <div className="flex gap-6 min-h-[400px]">
      <div className="flex-1 space-y-4">{mainContent}</div>
      <div className="w-56 flex-shrink-0 space-y-4 border-l pl-6" style={{ borderColor: 'var(--border-soft)' }}>
        {metadataRail}
      </div>
    </div>
  )
}
```

```jsx
// src/components/tasks/TaskModalMobile.jsx
// Purpose: Mobile task detail layout — full-screen, tabbed Details/Subtasks.
import { useState } from 'react'

export default function TaskModalMobile({ detailsContent, subtasksContent }) {
  const [tab, setTab] = useState('details')
  return (
    <div className="min-h-[70vh] flex flex-col">
      <div className="flex gap-1 border-b mb-4" style={{ borderColor: 'var(--border-soft)' }}>
        {[['details', 'Details'], ['subtasks', 'Subtasks']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
            style={{
              borderColor: tab === id ? 'var(--accent)' : 'transparent',
              color: tab === id ? 'var(--accent)' : 'var(--text-muted)',
            }}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'details' ? detailsContent : subtasksContent}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire both into `TaskDetail.jsx`**

In `src/components/tasks/TaskDetail.jsx`, import both new components plus a viewport check:

```jsx
import TaskModalDesktop from './TaskModalDesktop'
import TaskModalMobile  from './TaskModalMobile'
import { useState, useEffect } from 'react'
```

Add a resize-aware flag near the top of the component body (co-locate with existing `useState` calls):

```jsx
const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
useEffect(() => {
  const onResize = () => setIsDesktop(window.innerWidth >= 768)
  window.addEventListener('resize', onResize)
  return () => window.removeEventListener('resize', onResize)
}, [])
```

Group the existing field JSX into three variables just before the `return`: `mainFields` (title + notes inputs), `metaFields` (priority/category/due-date/recurrence controls), `subtaskFields` (the subtask list/add-input section) — using the exact JSX that already exists in the file, just reassigned into these three named chunks instead of one flat block. Then render:

```jsx
{isDesktop ? (
  <TaskModalDesktop mainContent={mainFields} metadataRail={metaFields} />
) : (
  <TaskModalMobile
    detailsContent={<>{mainFields}{metaFields}</>}
    subtasksContent={subtaskFields}
  />
)}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Visual check — both widths**

`npm run dev`. At desktop width: open a task, confirm two-column layout (content left, metadata right), all fields still editable and save correctly. Resize below 768px: confirm it switches to full-screen tabbed (Details/Subtasks), both tabs show correct content, editing still works.

- [ ] **Step 6: Mark done (no commit)**

---

## Task 7: Habits view → cards with streak-strip

**Files:**
- Create: `src/components/habits/HabitCard.jsx`
- Modify: `src/components/habits/HabitsView.jsx`

- [ ] **Step 1: Read current habit row rendering and streak calc**

Run: `grep -n "streak\|HabitRow\|log\[" src/components/habits/HabitsView.jsx src/hooks/useHabits.js | head -40`

Use this to confirm the exact prop names for a habit object, the `log` shape (keyed by date), and however streak count is currently derived, so `HabitCard` reads real data instead of guessed field names.

- [ ] **Step 2: Create `HabitCard`**

```jsx
// src/components/habits/HabitCard.jsx
// Purpose: One habit as its own card — name, today's toggle, 7-day streak strip.
//          Replaces the shared weekly-grid row. `last7` is an array of 7
//          booleans/nulls (done/not-done/future) for the current week, oldest
//          first — computed by the caller from `log` (see HabitsView Step 3).
export default function HabitCard({ habit, doneToday, last7, onToggleToday }) {
  return (
    <div className="rounded-2xl p-4 flex items-center justify-between gap-3"
      style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          aria-label={`Mark ${habit.name} ${doneToday ? 'not done' : 'done'} today`}
          aria-pressed={doneToday}
          onClick={() => onToggleToday(habit.id)}
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-base transition-all"
          style={{
            backgroundColor: doneToday ? 'var(--accent)' : 'var(--bg-secondary)',
            color: doneToday ? '#fff' : 'var(--text-faint)',
          }}>
          {doneToday ? '✓' : habit.emoji || '○'}
        </button>
        <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{habit.name}</span>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {last7.map((state, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded"
            style={{
              backgroundColor: state === true ? 'var(--accent)' : state === false ? 'var(--accent-mid)' : 'var(--border-soft)',
            }} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Replace grid rendering in `HabitsView.jsx` with a `HabitCard` list**

Import `HabitCard` and, using the field names confirmed in Step 1, build a `last7` array per habit from the existing `log` state (7 entries covering the current week up to today, `true`/`false` for past days, `null` for future days in the week). Replace the existing `HabitRow`-per-habit grid render with:

```jsx
<div className="space-y-2">
  {habits.habits.map(h => (
    <HabitCard
      key={h.id}
      habit={h}
      doneToday={/* existing per-habit "done today" check from current code */}
      last7={/* computed 7-entry array described above */}
      onToggleToday={habits.toggleToday /* use the actual toggle function name found in Step 1 */}
    />
  ))}
</div>
```

Keep the existing empty-state and "+ Add habit" entry points unchanged — only the per-habit rendering changes.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Visual check**

`npm run dev` — Habits tab shows one card per habit, toggling today's circle updates immediately, streak strip shows correct filled/empty state for the last 7 days, existing weekly heatmap (`HabitCalendar.jsx`) still reachable as a secondary view if it had its own entry point.

- [ ] **Step 6: Mark done (no commit)**

---

## Task 8: Habit modal → two-step wizard

**Files:**
- Create: `src/components/habits/AddHabitWizard.jsx`
- Modify: `src/components/habits/AddHabitModal.jsx`

- [ ] **Step 1: Read the current `AddHabitModal.jsx` fields**

Run: `grep -n "useState\|<input\|<select" src/components/habits/AddHabitModal.jsx`

Separate the fields into "basics" (name, emoji/icon, frequency) vs "advanced" (rules via `HabitRulesPanel`, reminders, pairing suggestion) based on what's actually there.

- [ ] **Step 2: Create the wizard shell**

```jsx
// src/components/habits/AddHabitWizard.jsx
// Purpose: Two-step habit creation — Step 1 basics, Step 2 optional advanced
//          rules/reminders/pairing. Step content is passed in by the parent
//          (AddHabitModal.jsx) which still owns all form state — this
//          component only handles step navigation + the progress dots.
import { useState } from 'react'

export default function AddHabitWizard({ basicsStep, advancedStep, onSubmit, canAdvance }) {
  const [step, setStep] = useState(1)
  return (
    <div className="space-y-5">
      <div className="flex gap-1.5 justify-center">
        {[1, 2].map(n => (
          <div key={n} className="h-1.5 rounded-full transition-all"
            style={{ width: step === n ? 24 : 8, backgroundColor: step >= n ? 'var(--accent)' : 'var(--border)' }} />
        ))}
      </div>
      {step === 1 ? basicsStep : advancedStep}
      <div className="flex justify-between pt-2">
        {step === 2 ? (
          <button onClick={() => setStep(1)} className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>← Back</button>
        ) : <span />}
        {step === 1 ? (
          <button disabled={!canAdvance} onClick={() => setStep(2)}
            className="px-4 py-2 rounded-full text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)' }}>Next →</button>
        ) : (
          <button onClick={onSubmit}
            className="px-4 py-2 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--accent)' }}>Save habit</button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire into `AddHabitModal.jsx`**

Import `AddHabitWizard`. Keep every existing `useState` field and the existing submit function as-is. Split the existing form JSX into two chunks — `basicsFields` (name/emoji/frequency inputs) and `advancedFields` (`HabitRulesPanel`, reminder input, `HabitPairingSuggestion` if rendered here) — then replace the modal body with:

```jsx
<AddHabitWizard
  basicsStep={basicsFields}
  advancedStep={advancedFields}
  canAdvance={name.trim().length > 0 /* use the actual name-state variable from this file */}
  onSubmit={handleSubmit /* use the actual existing submit handler name */}
/>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Visual check**

`npm run dev` — open "+ Add habit". Confirm Step 1 shows name/emoji/frequency, "Next" is disabled until a name is entered, Step 2 shows rules/reminders, "Back" returns to Step 1 with values preserved, "Save habit" creates the habit correctly (verify it appears in the list from Task 7).

- [ ] **Step 6: Mark done (no commit)**

---

## Task 9: Workouts view → weekly rings + template-picker modal

**Files:**
- Create: `src/components/workouts/WeeklyRings.jsx`
- Create: `src/components/workouts/WorkoutTemplatePicker.jsx`
- Modify: `src/components/workouts/WorkoutsView.jsx`
- Modify: `src/components/workouts/WorkoutForm.jsx`

- [ ] **Step 1: Read current session data shape**

Run: `grep -n "addSession\|sessions\.\|const \[.*=.*useState" src/hooks/useWorkouts.js src/components/workouts/WorkoutsView.jsx | head -30`

Confirms session fields (date, type, duration, exercises) and how `sessions` is filtered/displayed today.

- [ ] **Step 2: Create `WeeklyRings`**

```jsx
// src/components/workouts/WeeklyRings.jsx
// Purpose: 7-ring row for the current week — fill state per day (done/partial/
//          rest), tap a ring to select that day. `days` is an array of 7
//          { date, label, state } objects, oldest first, computed by the
//          caller from `sessions` (see WorkoutsView Step 3).
export default function WeeklyRings({ days, selectedDate, onSelect }) {
  return (
    <div className="rounded-3xl p-5" style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
      <div className="flex justify-between">
        {days.map(d => {
          const filled = d.state === 'done' ? 1 : d.state === 'partial' ? 0.5 : 0
          const circumference = 2 * Math.PI * 14
          return (
            <button key={d.date} onClick={() => onSelect(d.date)}
              aria-label={`${d.label}: ${d.state}`}
              className="flex flex-col items-center gap-1">
              <svg width="34" height="34" viewBox="0 0 34 34">
                <circle cx="17" cy="17" r="14" fill="none" stroke="var(--border-soft)" strokeWidth="4" />
                <circle cx="17" cy="17" r="14" fill="none" stroke="var(--accent)" strokeWidth="4"
                  strokeDasharray={circumference} strokeDashoffset={circumference * (1 - filled)}
                  strokeLinecap="round" transform="rotate(-90 17 17)"
                  style={{ opacity: d.date === selectedDate ? 1 : 0.7 }} />
              </svg>
              <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{d.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire `WeeklyRings` + expandable session card into `WorkoutsView.jsx`**

Using field names confirmed in Step 1, compute a 7-day `days` array (Mon–Sun of the current week, `state` = `'done'` if a session exists that day, `'rest'` otherwise — `'partial'` only if the data model distinguishes partial completion, otherwise omit that state). Add local `selectedDate` state (default: today). Render `WeeklyRings` above the existing session list, and filter/highlight the session card matching `selectedDate` below it:

```jsx
import WeeklyRings from './WeeklyRings'
import { useState } from 'react'
// ...
const [selectedDate, setSelectedDate] = useState(getTodayKey())
// ...in the render, above the existing session list:
<WeeklyRings days={weekDays} selectedDate={selectedDate} onSelect={setSelectedDate} />
```

Keep the existing full session history list below unchanged — `WeeklyRings` is additive, it doesn't replace the history list per the spec (rings are the hero, list stays secondary).

- [ ] **Step 4: Create `WorkoutTemplatePicker`**

```jsx
// src/components/workouts/WorkoutTemplatePicker.jsx
// Purpose: First screen of the log-workout modal — pick a recent/recurring
//          session to repeat (pre-fills the form), or start blank.
//          `recentSessions` = last N distinct-by-type sessions, newest first,
//          computed by the caller from `sessions`.
export default function WorkoutTemplatePicker({ recentSessions, onPick, onBlank }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium px-1" style={{ color: 'var(--text)' }}>Start from...</p>
      {recentSessions.map(s => (
        <button key={s.id} onClick={() => onPick(s)}
          className="w-full text-left rounded-xl p-3 text-sm"
          style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
          {s.type} <span style={{ color: 'var(--text-faint)' }}>· last: {s.date}</span>
        </button>
      ))}
      <button onClick={onBlank}
        className="w-full text-left rounded-xl p-3 text-sm"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
        + Blank session
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Wire into `WorkoutForm.jsx`**

Add a `useState` for whether a template was picked/skipped (`const [started, setStarted] = useState(false)`). At the top of the render, before the existing form fields: if `!started`, render `WorkoutTemplatePicker` (computing `recentSessions` from the sessions prop/hook already available in this file — last 5 distinct-by-type, newest first); `onPick` should pre-fill the existing form state with that session's type/exercises and call `setStarted(true)`; `onBlank` should just call `setStarted(true)` with form state left at its current defaults. Once `started` is true, render the existing form fields exactly as they are today.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 7: Visual check**

`npm run dev` — Workouts tab shows the ring row, tapping a ring highlights that day's session below. Opening "Log workout" shows the template picker first; picking a template pre-fills the form; "Blank session" opens an empty form; saving either way still creates a session correctly.

- [ ] **Step 8: Mark done (no commit)**

---

## Task 10: Routines view → cards + run mode; editor → step-builder cards

**Files:**
- Create: `src/components/routines/RoutineRunMode.jsx`
- Create: `src/components/routines/StepBuilderCard.jsx`
- Modify: `src/components/routines/RoutinesView.jsx`
- Modify: `src/components/routines/RoutineEditor.jsx`

- [ ] **Step 1: Read current routine/step data shape**

Run: `grep -n "steps\|const \[.*=.*useState" src/hooks/useRoutines.js src/components/routines/RoutineCard.jsx | head -30`

Confirms step object shape (`id`, `text`, `duration` per the `DEFAULT_ROUTINES` seen earlier) and existing CRUD function names on the routines hook.

- [ ] **Step 2: Create `RoutineRunMode`**

```jsx
// src/components/routines/RoutineRunMode.jsx
// Purpose: Full-screen, distraction-free step-by-step execution of a routine.
//          `steps` = the routine's step array ({id, text, duration}). Advances
//          on tap/click; onFinish fires after the last step (caller decides
//          what "finishing" means — e.g. marking the routine's log entry done).
import { useState } from 'react'

export default function RoutineRunMode({ routine, steps, onFinish, onExit }) {
  const [idx, setIdx] = useState(0)
  const step = steps[idx]
  const isLast = idx === steps.length - 1

  const advance = () => isLast ? onFinish() : setIdx(i => i + 1)

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center text-center px-6"
      style={{ backgroundColor: 'var(--bg)' }}>
      <button onClick={onExit} aria-label="Exit run mode"
        className="absolute top-6 right-6 text-sm" style={{ color: 'var(--text-faint)' }}>✕ Exit</button>
      <p className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-faint)' }}>
        Step {idx + 1} of {steps.length}
      </p>
      <h2 className="font-serif text-3xl font-semibold mb-2" style={{ color: 'var(--text)' }}>{step.text}</h2>
      {step.duration && <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>{step.duration} min</p>}
      <button onClick={advance}
        className="px-8 py-3 rounded-full text-white font-medium"
        style={{ backgroundColor: 'var(--accent)' }}>
        {isLast ? 'Finish' : 'Next →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Wire "Run" into `RoutinesView.jsx`**

Add local state for the active running routine (`const [running, setRunning] = useState(null)`). Add a "▶ Run" button to each routine card's actions (alongside existing edit/delete controls) that calls `setRunning(routine)`. Render conditionally at the bottom of the component:

```jsx
{running && (
  <RoutineRunMode
    routine={running}
    steps={running.steps}
    onExit={() => setRunning(null)}
    onFinish={() => { /* call the existing routine-log "mark done" function from useRoutines, using the real function name found in Step 1 */ setRunning(null) }}
  />
)}
```

- [ ] **Step 4: Create `StepBuilderCard`**

```jsx
// src/components/routines/StepBuilderCard.jsx
// Purpose: One numbered step in the routine editor — title, duration, optional
//          note, up/down reorder controls. Parent owns the steps array and
//          passes down index-based handlers.
export default function StepBuilderCard({ step, index, total, onChange, onMoveUp, onMoveDown, onRemove }) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--accent-light)' }}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--accent)' }}>{index + 1}.</span>
        <input
          value={step.text}
          onChange={e => onChange({ ...step, text: e.target.value })}
          className="flex-1 bg-transparent text-sm font-medium outline-none"
          style={{ color: 'var(--text)' }}
          placeholder="Step name"
        />
        <input
          type="number"
          value={step.duration ?? ''}
          onChange={e => onChange({ ...step, duration: e.target.value ? Number(e.target.value) : null })}
          className="w-14 bg-transparent text-xs text-right outline-none"
          style={{ color: 'var(--text-faint)' }}
          placeholder="min"
        />
      </div>
      <div className="flex justify-end gap-2 mt-1">
        <button disabled={index === 0} onClick={onMoveUp} aria-label="Move step up" className="text-xs disabled:opacity-30" style={{ color: 'var(--text-faint)' }}>↑</button>
        <button disabled={index === total - 1} onClick={onMoveDown} aria-label="Move step down" className="text-xs disabled:opacity-30" style={{ color: 'var(--text-faint)' }}>↓</button>
        <button onClick={onRemove} aria-label="Remove step" className="text-xs" style={{ color: 'var(--text-faint)' }}>✕</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Wire into `RoutineEditor.jsx`**

Replace the existing step-list rendering with `StepBuilderCard`, keeping the existing steps-array state and its add/remove logic. Reorder handlers swap the step at `index` with `index-1` (up) or `index+1` (down) in the array:

```jsx
import StepBuilderCard from './StepBuilderCard'
// ...
{steps.map((step, i) => (
  <StepBuilderCard
    key={step.id}
    step={step}
    index={i}
    total={steps.length}
    onChange={updated => setSteps(prev => prev.map((s, idx) => idx === i ? updated : s))}
    onMoveUp={() => setSteps(prev => { const arr = [...prev]; [arr[i-1], arr[i]] = [arr[i], arr[i-1]]; return arr })}
    onMoveDown={() => setSteps(prev => { const arr = [...prev]; [arr[i+1], arr[i]] = [arr[i], arr[i+1]]; return arr })}
    onRemove={() => setSteps(prev => prev.filter((_, idx) => idx !== i))}
  />
))}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 7: Visual check**

`npm run dev` — Routines tab: tapping "▶ Run" on a routine opens full-screen run mode, "Next" advances through steps, "Finish" on the last step closes it and marks the routine done for today, "✕ Exit" closes without marking done. Routine editor: steps render as numbered cards, up/down reorder works and disables at the ends, editing text/duration persists, "✕" removes a step.

- [ ] **Step 8: Mark done (no commit)**

---

## Task 11: Calendar view → month grid + day detail panel

**Files:**
- Create: `src/components/calendar/DayDetailPanel.jsx`
- Modify: `src/components/calendar/CalendarView.jsx`

- [ ] **Step 1: Read current calendar data wiring**

Run: `grep -n "tasks\.\|selectedDate\|useState" src/components/calendar/CalendarView.jsx | head -30`

Confirms how the month grid currently gets task data per day and whether a "selected day" concept already exists to extend rather than duplicate.

- [ ] **Step 2: Create `DayDetailPanel`**

```jsx
// src/components/calendar/DayDetailPanel.jsx
// Purpose: Side panel showing the selected day's tasks. `dayTasks` is the
//          array already filtered to the selected date by the caller
//          (CalendarView, via tasks.getTasksByDate).
export default function DayDetailPanel({ date, dayTasks, onToggleTask, onOpenTask }) {
  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}>
      <h3 className="font-serif text-lg font-semibold" style={{ color: 'var(--text)' }}>{date}</h3>
      {dayTasks.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Nothing scheduled.</p>
      ) : (
        <ul className="space-y-1.5">
          {dayTasks.map(t => (
            <li key={t.id} className="flex items-center gap-2 cursor-pointer" onClick={() => onOpenTask(t)}>
              <button
                onClick={e => { e.stopPropagation(); onToggleTask(t.id) }}
                className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px]"
                style={{
                  backgroundColor: t.completed ? 'var(--accent)' : 'transparent',
                  borderColor: t.completed ? 'var(--accent)' : 'var(--border)',
                  color: '#fff',
                }}>
                {t.completed && '✓'}
              </button>
              <span className="text-sm truncate" style={{ color: t.completed ? 'var(--text-faint)' : 'var(--text)', textDecoration: t.completed ? 'line-through' : 'none' }}>
                {t.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Wire into `CalendarView.jsx`**

Add `selectedDate` state if one doesn't already exist (default: today's date key). Render the existing month grid and `DayDetailPanel` side-by-side on desktop, stacked on mobile:

```jsx
import DayDetailPanel from './DayDetailPanel'
// ...
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">{/* existing month grid JSX unchanged, but each day cell's onClick should call setSelectedDate(dateKey) in addition to whatever it already does */}</div>
  <div className="md:w-72 flex-shrink-0">
    <DayDetailPanel
      date={selectedDate}
      dayTasks={tasks.getTasksByDate(selectedDate)}
      onToggleTask={tasks.toggleTask}
      onOpenTask={/* existing task-open handler if CalendarView has one, otherwise a local setDetail-style state */}
    />
  </div>
</div>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ built`, no errors.

- [ ] **Step 5: Visual check**

`npm run dev` — Calendar tab: clicking a day in the grid updates the detail panel with that day's tasks, toggling a task in the panel updates its state, panel stacks below the grid on mobile widths.

- [ ] **Step 6: Mark done (no commit)**

---

## Task 12: Final cross-cutting verification

**Files:** none (verification only)

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: `✓ built`, zero errors, zero warnings (matches the clean baseline from the initial audit).

- [ ] **Step 2: Full manual smoke pass**

`npm run dev`. At desktop width and at a mobile emulation width (<768px), for each of: Today, Tasks, Habits, Workouts, Routines, Calendar — open the view, open its "add/edit" modal, create one item, edit it, delete it. Confirm no console errors in devtools, no visually broken/overlapping elements, and that switching all 3 themes (Light/Dark/Forest) via `ThemeToggle` doesn't break contrast or layout on any of these views.

- [ ] **Step 3: Confirm no gamification remnants**

Run: `grep -rn "useXP\|XPBadge\|useAchievements\|AchievementsView" src` — expect zero matches.

- [ ] **Step 4: Mark plan complete (no commit — user commits manually)**
