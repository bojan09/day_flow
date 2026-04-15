// Service: migrationService
// Purpose: On first login, detect localStorage data and offer to import it to Supabase
import { storage } from './storage'
import {
  tasksService, notesService, habitsService,
  goalsService, ideasService, projectsService,
  bookmarksService, kvService,
} from './supabaseDataService'

const MIGRATION_KEY = 'dayflow_migrated'

export function hasMigrated() {
  return localStorage.getItem(MIGRATION_KEY) === 'true'
}

export function hasLocalData() {
  const tasks = storage.get('tasks', [])
  const notes = storage.get('notes', [])
  const habits = storage.get('habits', [])
  return tasks.length > 0 || notes.length > 0 || habits.length > 0
}

export async function migrateToSupabase(userId) {
  if (hasMigrated()) return { skipped: true }

  const tasks    = storage.get('tasks',    [])
  const notes    = storage.get('notes',    [])
  const habits   = storage.get('habits',   [])
  const log      = storage.get('habit_log',{})
  const goals    = storage.get('goals',    [])
  const ideas    = storage.get('ideas',    [])
  const projects = storage.get('projects', [])
  const bookmarks = storage.get('bookmarks',[])

  // KV-stored data
  const kvKeys = [
    'intentions','moods','gratitude','water_log','energy_log',
    'affirmations','task_templates','someday','routine_log',
    'habit_rules','challenge_log','challenges','balance_wheel',
    'monthly_letters','pomodoro_history','eod_reviews','xp_log',
  ]

  try {
    // Upload all collections in parallel batches
    await Promise.all([
      ...tasks.map(t     => tasksService.upsert(userId, t)),
      ...notes.map(n     => notesService.upsert(userId, n)),
      ...habits.map(h    => habitsService.upsertHabit(userId, h)),
      ...goals.map(g     => goalsService.upsert(userId, g)),
      ...ideas.map(i     => ideasService.upsert(userId, i)),
      ...projects.map(p  => projectsService.upsert(userId, p)),
      ...bookmarks.map(b => bookmarksService.upsert(userId, b)),
    ])

    // Migrate habit log
    for (const [key, done] of Object.entries(log)) {
      const [habitId, dateKey] = key.split('_')
      if (habitId && dateKey && done) {
        await habitsService.toggleLog(userId, habitId, dateKey, true)
      }
    }

    // Migrate KV data
    for (const key of kvKeys) {
      const value = storage.get(key, null)
      if (value !== null) await kvService.set(userId, key, value)
    }

    localStorage.setItem(MIGRATION_KEY, 'true')
    return { success: true, counts: { tasks: tasks.length, notes: notes.length, habits: habits.length } }
  } catch (err) {
    console.error('[DayFlow] Migration failed:', err)
    return { error: err }
  }
}
