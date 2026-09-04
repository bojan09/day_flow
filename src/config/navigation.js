// Config: navigation
// Single source of truth for nav destinations. SideNav, MobileDrawer and the
// customisable BottomNav all read from here — they previously each carried
// their own hand-maintained copy of this list, so changing one tab's label or
// icon meant editing three files and quietly getting it wrong in one of them.

export const NAV_TABS = {
  today:     { id: 'today',     label: 'Today',        emoji: '☀️' },
  tasks:     { id: 'tasks',     label: 'DailyGoals',   emoji: '🎯' },
  rhythm:    { id: 'rhythm',    label: 'Daily Rhythm', emoji: '🔁' },
  workouts:  { id: 'workouts',  label: 'Workouts',     emoji: '🏋️' },
  insights:  { id: 'insights',  label: 'Insights',     emoji: '📊' },
  capture:   { id: 'capture',   label: 'Capture',      emoji: '📥' },
  focus:     { id: 'focus',     label: 'Focus',        emoji: '⏱️' },
  calendar:  { id: 'calendar',  label: 'Calendar',     emoji: '📅' },
  timeblock: { id: 'timeblock', label: 'Schedule',     emoji: '⏰' },
  projects:  { id: 'projects',  label: 'Projects',     emoji: '🗂️' },
  search:    { id: 'search',    label: 'Search',       emoji: '🔍' },
}

const pick = (...ids) => ids.map(id => NAV_TABS[id])

// Always visible — the tabs used every day.
export const PRIMARY_TABS = pick('today', 'tasks', 'rhythm', 'workouts', 'insights', 'capture')

// Secondary — behind a collapsed-by-default "More" toggle.
export const MORE_TABS = pick('focus', 'calendar', 'timeblock', 'projects', 'search')

// Everything the mobile bottom nav can be customised to show.
export const ALL_MODULES = pick(
  'today', 'tasks', 'rhythm', 'focus', 'workouts', 'capture', 'calendar', 'insights', 'projects',
)
