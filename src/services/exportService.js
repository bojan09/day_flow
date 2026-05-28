// Service: exportService
// Purpose: Export any data type as CSV or full backup as JSON.
//          All exports are client-side — no server call needed.
import { format } from 'date-fns'

// ── Shared download helper ────────────────────────────────────────────────────
function download(content, filename, mime = 'text/csv') {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── CSV builder ───────────────────────────────────────────────────────────────
function buildCSV(headers, rows) {
  const escape = (v) =>
    v === null || v === undefined ? '' :
    typeof v === 'boolean' ? (v ? 'Yes' : 'No') :
    typeof v === 'string' && (v.includes(',') || v.includes('"') || v.includes('\n'))
      ? `"${v.replace(/"/g, '""')}"` : String(v)

  return [
    headers.join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ].join('\n')
}

const stamp = () => format(new Date(), 'yyyy-MM-dd')

// ── Individual CSV exports ────────────────────────────────────────────────────
export function exportTasksAsCSV(tasks = []) {
  const headers = ['Title', 'Priority', 'Category', 'Date', 'Due Time', 'Completed',
                   'Completed At', 'Estimate (min)', 'Recurring', 'Project ID', 'Notes']
  const rows = tasks.map(t => [
    t.title, t.priority, t.category, t.date, t.dueTime || '',
    t.completed, t.completedAt || '', t.estimateMins || '',
    t.isRecurring || false, t.projectId || '', t.notes || '',
  ])
  download(buildCSV(headers, rows), `dayflow-tasks-${stamp()}.csv`)
}

export function exportHabitsAsCSV(habits = [], log = {}) {
  const headers = ['Habit', 'Icon', 'Frequency', 'Created At']
  const rows = habits.map(h => [h.name, h.icon || '', h.frequency || 'daily', h.createdAt || ''])
  download(buildCSV(headers, rows), `dayflow-habits-${stamp()}.csv`)
}

export function exportHabitLogAsCSV(habits = [], log = {}) {
  // One row per habit-day combination
  const headers = ['Habit', 'Date', 'Completed']
  const rows = []
  Object.keys(log).forEach(key => {
    // key format: habitId_dateKey
    const [habitId, date] = key.split('_')
    const habit = habits.find(h => h.id === habitId)
    if (habit && date && log[key]) {
      rows.push([habit.name, date, true])
    }
  })
  rows.sort((a, b) => b[1].localeCompare(a[1]))
  download(buildCSV(headers, rows), `dayflow-habit-log-${stamp()}.csv`)
}

export function exportMoodsAsCSV(moods = {}) {
  const headers = ['Date', 'Score', 'Label', 'Note', 'Logged At']
  const LABELS  = { 5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Low', 1: 'Rough' }
  const rows = Object.entries(moods)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, m]) => [date, m.score, LABELS[m.score] || '', m.note || '', m.loggedAt || ''])
  download(buildCSV(headers, rows), `dayflow-mood-${stamp()}.csv`)
}

export function exportNotesAsCSV(notes = []) {
  const headers = ['Title', 'Content', 'Tags', 'Created At', 'Updated At']
  const rows = notes.map(n => [
    n.title || '', n.content || '', (n.tags || []).join('; '),
    n.createdAt || '', n.updatedAt || '',
  ])
  download(buildCSV(headers, rows), `dayflow-notes-${stamp()}.csv`)
}

export function exportGoalsAsCSV(goals = []) {
  const headers = ['Title', 'Type', 'Emoji', 'Completed', 'Target Date',
                   'Milestones Total', 'Milestones Done', 'Created At']
  const rows = goals.map(g => {
    const total = (g.milestones || []).length
    const done  = (g.milestones || []).filter(m => m.done).length
    return [g.title, g.type || '', g.emoji || '', g.completed || false,
            g.targetDate || '', total, done, g.createdAt || '']
  })
  download(buildCSV(headers, rows), `dayflow-goals-${stamp()}.csv`)
}

export function exportWorkoutsAsCSV(sessions = []) {
  const headers = ['Title', 'Type', 'Date', 'Duration (min)', 'Completed',
                   'Muscle Groups', 'Notes']
  const rows = sessions.map(s => [
    s.title, s.type || '', s.date, s.durationMins || '',
    s.completed || false, (s.muscleGroups || []).join('; '), s.notes || '',
  ])
  download(buildCSV(headers, rows), `dayflow-workouts-${stamp()}.csv`)
}

// ── Full JSON backup ─────────────────────────────────────────────────────────
export function exportFullBackup({
  tasks, notes, habits, moods, intentions,
  goals, workouts, ideas, bookmarks, water, energy,
}) {
  const payload = {
    exportedAt:  new Date().toISOString(),
    version:     '2.0',
    appVersion:  'DayFlow v6.x',
    tasks:       tasks?.tasks        || [],
    notes:       notes?.notes        || [],
    habits: {
      list:      habits?.habits      || [],
      log:       habits?.log         || {},
    },
    moods:       moods               || {},
    intentions:  intentions          || {},
    goals:       goals?.goals        || [],
    workouts:    workouts?.sessions  || [],
    ideas:       ideas?.ideas        || [],
    bookmarks:   bookmarks?.bookmarks || [],
    water:       water               || {},
    energy:      energy              || {},
  }
  download(
    JSON.stringify(payload, null, 2),
    `dayflow-backup-${stamp()}.json`,
    'application/json'
  )
}

// ── Import + validate backup ─────────────────────────────────────────────────
export function validateBackup(json) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json
    // Must have at least one expected key
    const EXPECTED_KEYS = ['tasks', 'notes', 'habits', 'moods', 'goals', 'workouts']
    const hasData = EXPECTED_KEYS.some(k => data[k] !== undefined)
    if (!hasData) return { ok: false, error: 'File does not look like a DayFlow backup.' }
    const counts = {
      tasks:    Array.isArray(data.tasks)          ? data.tasks.length    : 0,
      notes:    Array.isArray(data.notes)          ? data.notes.length    : 0,
      habits:   Array.isArray(data.habits?.list)   ? data.habits.list.length : 0,
      goals:    Array.isArray(data.goals)          ? data.goals.length    : 0,
      workouts: Array.isArray(data.workouts)       ? data.workouts.length : 0,
    }
    return { ok: true, data, counts, exportedAt: data.exportedAt, version: data.version }
  } catch {
    return { ok: false, error: 'Invalid JSON — the file may be corrupted.' }
  }
}
