// Service: supabaseDataService
// Purpose: CRUD helpers for each data type — uses mappers to translate
//          camelCase JS fields ↔ snake_case Supabase columns.
import { supabase, isSupabaseConfigured } from './supabaseClient'
import {
  taskMapper, noteMapper, ideaMapper,
  goalMapper, projectMapper, bookmarkMapper,
} from './mappers'
import { remoteFailure, remoteSuccess } from './syncResult'
import { notificationPreferencesFromDb, notificationPreferencesToDb } from './notificationPreferences'

const unconfigured = () => remoteFailure(new Error('Supabase is not configured'))
const throwIfError = (error, operation) => {
  if (error) throw new Error(`${operation}: ${error.message}`)
}

// ── Generic key-value store ─────────────────────────────────────────────────
export const kvService = {
  async get(userId, key) {
    if (!isSupabaseConfigured()) return unconfigured()
    const { data, error } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', userId)
      .eq('key', key)
      .maybeSingle()
    if (error) return remoteFailure(error)
    return remoteSuccess(data?.value ?? null)
  },

  async set(userId, key, value) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('user_data').upsert(
      { user_id: userId, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    )
    throwIfError(error, 'kvService.set')
  },
}

export const notificationPreferencesService = {
  async get(userId) {
    if (!isSupabaseConfigured()) return unconfigured()
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) return remoteFailure(error)
    return remoteSuccess(data ? notificationPreferencesFromDb(data) : null)
  },

  async set(userId, preferences) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('notification_preferences').upsert(
      notificationPreferencesToDb(userId, preferences),
      { onConflict: 'user_id' },
    )
    throwIfError(error, 'notificationPreferencesService.set')
  },
}

// ── Tasks ───────────────────────────────────────────────────────────────────
export const tasksService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return unconfigured()
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) return remoteFailure(error)
    return remoteSuccess((data ?? []).map(taskMapper.fromDB))
  },

  async upsert(userId, task) {
    if (!isSupabaseConfigured()) return
    const row = taskMapper.toDB({ ...task, user_id: userId })
    const { error } = await supabase.from('tasks').upsert(row)
    throwIfError(error, 'tasksService.upsert')
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId)
    throwIfError(error, 'tasksService.delete')
  },
}

// ── Notes ───────────────────────────────────────────────────────────────────
export const notesService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return unconfigured()
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (error) return remoteFailure(error)
    return remoteSuccess((data ?? []).map(noteMapper.fromDB))
  },

  async upsert(userId, note) {
    if (!isSupabaseConfigured()) return
    const row = noteMapper.toDB({ ...note, user_id: userId })
    const { error } = await supabase.from('notes').upsert(row)
    throwIfError(error, 'notesService.upsert')
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', userId)
    throwIfError(error, 'notesService.delete')
  },
}

// ── Habits ──────────────────────────────────────────────────────────────────
export const habitsService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return unconfigured()
    const [{ data: habits, error: e1 }, { data: logRows, error: e2 }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('habit_log').select('habit_id,date_key,done').eq('user_id', userId),
    ])
    if (e1 || e2) return remoteFailure(e1 || e2)
    const log = {}
    for (const row of logRows ?? []) {
      log[`${row.habit_id}_${row.date_key}`] = row.done
    }
    return remoteSuccess({
      habits: (habits ?? []).map(h => ({
        id: h.id, name: h.name, icon: h.icon,
        frequency: h.frequency, createdAt: h.created_at,
      })),
      log,
    })
  },

  async upsertHabit(userId, habit) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('habits').upsert({
      id: habit.id, user_id: userId,
      name: habit.name, icon: habit.icon,
      frequency: habit.frequency, created_at: habit.createdAt,
    })
    throwIfError(error, 'habitsService.upsertHabit')
  },

  async deleteHabit(userId, id) {
    if (!isSupabaseConfigured()) return
    const results = await Promise.all([
      supabase.from('habits').delete().eq('id', id).eq('user_id', userId),
      supabase.from('habit_log').delete().eq('habit_id', id).eq('user_id', userId),
    ])
    for (const result of results) throwIfError(result.error, 'habitsService.deleteHabit')
  },

  async toggleLog(userId, habitId, dateKey, done) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('habit_log').upsert(
      { user_id: userId, habit_id: habitId, date_key: dateKey, done },
      { onConflict: 'user_id,habit_id,date_key' }
    )
    throwIfError(error, 'habitsService.toggleLog')
  },
}

// ── Goals ────────────────────────────────────────────────────────────────────
export const goalsService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return unconfigured()
    const { data, error } = await supabase
      .from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) return remoteFailure(error)
    return remoteSuccess((data ?? []).map(goalMapper.fromDB))
  },

  async upsert(userId, goal) {
    if (!isSupabaseConfigured()) return
    const row = goalMapper.toDB({ ...goal, user_id: userId })
    const { error } = await supabase.from('goals').upsert(row)
    throwIfError(error, 'goalsService.upsert')
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', userId)
    throwIfError(error, 'goalsService.delete')
  },
}

// ── Ideas ────────────────────────────────────────────────────────────────────
export const ideasService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return unconfigured()
    const { data, error } = await supabase
      .from('ideas').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) return remoteFailure(error)
    return remoteSuccess((data ?? []).map(ideaMapper.fromDB))
  },

  async upsert(userId, idea) {
    if (!isSupabaseConfigured()) return
    const row = ideaMapper.toDB({ ...idea, user_id: userId })
    const { error } = await supabase.from('ideas').upsert(row)
    throwIfError(error, 'ideasService.upsert')
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('ideas').delete().eq('id', id).eq('user_id', userId)
    throwIfError(error, 'ideasService.delete')
  },
}

// ── Projects ─────────────────────────────────────────────────────────────────
export const projectsService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return unconfigured()
    const { data, error } = await supabase
      .from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) return remoteFailure(error)
    return remoteSuccess((data ?? []).map(projectMapper.fromDB))
  },

  async upsert(userId, project) {
    if (!isSupabaseConfigured()) return
    const row = projectMapper.toDB({ ...project, user_id: userId })
    const { error } = await supabase.from('projects').upsert(row)
    throwIfError(error, 'projectsService.upsert')
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', userId)
    throwIfError(error, 'projectsService.delete')
  },
}

// ── Bookmarks ────────────────────────────────────────────────────────────────
export const bookmarksService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return unconfigured()
    const { data, error } = await supabase
      .from('bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) return remoteFailure(error)
    return remoteSuccess((data ?? []).map(bookmarkMapper.fromDB))
  },

  async upsert(userId, bookmark) {
    if (!isSupabaseConfigured()) return
    const row = bookmarkMapper.toDB({ ...bookmark, user_id: userId })
    const { error } = await supabase.from('bookmarks').upsert(row)
    throwIfError(error, 'bookmarksService.upsert')
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('bookmarks').delete().eq('id', id).eq('user_id', userId)
    throwIfError(error, 'bookmarksService.delete')
  },
}

// ── Profile ──────────────────────────────────────────────────────────────────
export const profileService = {
  async get(userId) {
    if (!isSupabaseConfigured()) return unconfigured()
    const { data, error } = await supabase
      .from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) return remoteFailure(error)
    return remoteSuccess(data)
  },

  async update(userId, updates) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...updates })
    throwIfError(error, 'profileService.update')
  },
}
