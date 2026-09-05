// Config: navigation
// Single source of truth for nav destinations. SideNav, MobileDrawer and the
// customisable BottomNav all read from here — they previously each carried
// their own hand-maintained copy of this list, so changing one tab's label or
// icon meant editing three files and quietly getting it wrong in one of them.
//
// Nav chrome renders `Icon` (Lucide) rather than `emoji`: emoji render at
// different weights and baselines per OS, which showed most in the nav where
// the icons sit in a row and any mismatch is obvious. `emoji` is kept because
// content surfaces (habits, moods, routines) still use it deliberately.
import {
  Sun, Target, Repeat, Dumbbell, ChartColumn, Inbox,
  Timer, Calendar, CalendarClock, FolderKanban, Search, Sunrise, Utensils,
} from 'lucide-react'

export const NAV_TABS = {
  today:     { id: 'today',     label: 'Today',        emoji: '☀️',  Icon: Sun },
  tasks:     { id: 'tasks',     label: 'DailyGoals',   emoji: '🎯', Icon: Target },
  rhythm:    { id: 'rhythm',    label: 'Daily Rhythm', emoji: '🔁', Icon: Repeat },
  workouts:  { id: 'workouts',  label: 'Workouts',     emoji: '🏋️', Icon: Dumbbell },
  insights:  { id: 'insights',  label: 'Insights',     emoji: '📊', Icon: ChartColumn },
  capture:   { id: 'capture',   label: 'Capture',      emoji: '📥', Icon: Inbox },
  focus:     { id: 'focus',     label: 'Focus',        emoji: '⏱️', Icon: Timer },
  calendar:  { id: 'calendar',  label: 'Calendar',     emoji: '📅', Icon: Calendar },
  timeblock: { id: 'timeblock', label: 'Schedule',     emoji: '⏰', Icon: CalendarClock },
  projects:  { id: 'projects',  label: 'Projects',     emoji: '🗂️', Icon: FolderKanban },
  search:    { id: 'search',    label: 'Search',       emoji: '🔍', Icon: Search },
  reflect:   { id: 'reflect',   label: 'Reflection',   emoji: '🌅', Icon: Sunrise },
  fasting:   { id: 'fasting',   label: 'Fasting',      emoji: '🍽️', Icon: Utensils },
}

const pick = (...ids) => ids.map(id => NAV_TABS[id])

// Always visible — the tabs used every day.
export const PRIMARY_TABS = pick('today', 'reflect', 'tasks', 'rhythm', 'workouts', 'insights', 'capture')

// Secondary — behind a collapsed-by-default "More" toggle.
// Reflection was originally here, but it is a central daily ritual rather than
// an occasional tool, so it sits in the primary row next to Today.
export const MORE_TABS = pick('fasting', 'focus', 'calendar', 'timeblock', 'projects', 'search')

// Everything the mobile bottom nav can be customised to show.
export const ALL_MODULES = pick(
  'today', 'reflect', 'tasks', 'rhythm', 'focus', 'workouts', 'capture', 'calendar', 'insights', 'projects', 'fasting',
)
