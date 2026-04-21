// Service: supabaseDataService
// Purpose: CRUD helpers for each data type — uses mappers to translate
//          camelCase JS fields ↔ snake_case Supabase columns.
import { supabase, isSupabaseConfigured } from './supabaseClient'
import {
  taskMapper, noteMapper, ideaMapper,
  goalMapper, projectMapper, bookmarkMapper,
} from './mappers'

// ── Generic key-value store ─────────────────────────────────────────────────
export const kvService = {
  async get(userId, key) {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', userId)
      .eq('key', key)
      .maybeSingle()
    if (error) console.error('[DayFlow] kvService.get:', error.message)
    return data?.value ?? null
  },

  async set(userId, key, value) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('user_data').upsert(
      { user_id: userId, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    )
    if (error) console.error('[DayFlow] kvService.set:', error.message)
  },
}

// ── Tasks ───────────────────────────────────────────────────────────────────
export const tasksService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) { console.error('[DayFlow] tasksService.getAll:', error.message); return [] }
    return (data ?? []).map(taskMapper.fromDB)
  },

  async upsert(userId, task) {
    if (!isSupabaseConfigured()) return
    const row = taskMapper.toDB({ ...task, user_id: userId })
    const { error } = await supabase.from('tasks').upsert(row)
    if (error) console.error('[DayFlow] tasksService.upsert:', error.message)
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId)
    if (error) console.error('[DayFlow] tasksService.delete:', error.message)
  },
}

// ── Notes ───────────────────────────────────────────────────────────────────
export const notesService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (error) { console.error('[DayFlow] notesService.getAll:', error.message); return [] }
    return (data ?? []).map(noteMapper.fromDB)
  },

  async upsert(userId, note) {
    if (!isSupabaseConfigured()) return
    const row = noteMapper.toDB({ ...note, user_id: userId })
    const { error } = await supabase.from('notes').upsert(row)
    if (error) console.error('[DayFlow] notesService.upsert:', error.message)
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', userId)
    if (error) console.error('[DayFlow] notesService.delete:', error.message)
  },
}

// ── Habits ──────────────────────────────────────────────────────────────────
export const habitsService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return { habits: [], log: {} }
    const [{ data: habits, error: e1 }, { data: logRows, error: e2 }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('habit_log').select('habit_id,date_key,done').eq('user_id', userId),
    ])
    if (e1) console.error('[DayFlow] habitsService.getAll habits:', e1.message)
    if (e2) console.error('[DayFlow] habitsService.getAll log:', e2.message)
    const log = {}
    for (const row of logRows ?? []) {
      log[`${row.habit_id}_${row.date_key}`] = row.done
    }
    return {
      habits: (habits ?? []).map(h => ({
        id: h.id, name: h.name, icon: h.icon,
        frequency: h.frequency, createdAt: h.created_at,
      })),
      log,
    }
  },

  async upsertHabit(userId, habit) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('habits').upsert({
      id: habit.id, user_id: userId,
      name: habit.name, icon: habit.icon,
      frequency: habit.frequency, created_at: habit.createdAt,
    })
    if (error) console.error('[DayFlow] habitsService.upsertHabit:', error.message)
  },

  async deleteHabit(userId, id) {
    if (!isSupabaseConfigured()) return
    await Promise.all([
      supabase.from('habits').delete().eq('id', id).eq('user_id', userId),
      supabase.from('habit_log').delete().eq('habit_id', id).eq('user_id', userId),
    ])
  },

  async toggleLog(userId, habitId, dateKey, done) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('habit_log').upsert(
      { user_id: userId, habit_id: habitId, date_key: dateKey, done },
      { onConflict: 'user_id,habit_id,date_key' }
    )
    if (error) console.error('[DayFlow] habitsService.toggleLog:', error.message)
  },
}

// ── Goals ────────────────────────────────────────────────────────────────────
export const goalsService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) { console.error('[DayFlow] goalsService.getAll:', error.message); return [] }
    return (data ?? []).map(goalMapper.fromDB)
  },

  async upsert(userId, goal) {
    if (!isSupabaseConfigured()) return
    const row = goalMapper.toDB({ ...goal, user_id: userId })
    const { error } = await supabase.from('goals').upsert(row)
    if (error) console.error('[DayFlow] goalsService.upsert:', error.message)
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', userId)
    if (error) console.error('[DayFlow] goalsService.delete:', error.message)
  },
}

// ── Ideas ────────────────────────────────────────────────────────────────────
export const ideasService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('ideas').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) { console.error('[DayFlow] ideasService.getAll:', error.message); return [] }
    return (data ?? []).map(ideaMapper.fromDB)
  },

  async upsert(userId, idea) {
    if (!isSupabaseConfigured()) return
    const row = ideaMapper.toDB({ ...idea, user_id: userId })
    const { error } = await supabase.from('ideas').upsert(row)
    if (error) console.error('[DayFlow] ideasService.upsert:', error.message)
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('ideas').delete().eq('id', id).eq('user_id', userId)
    if (error) console.error('[DayFlow] ideasService.delete:', error.message)
  },
}

// ── Projects ─────────────────────────────────────────────────────────────────
export const projectsService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) { console.error('[DayFlow] projectsService.getAll:', error.message); return [] }
    return (data ?? []).map(projectMapper.fromDB)
  },

  async upsert(userId, project) {
    if (!isSupabaseConfigured()) return
    const row = projectMapper.toDB({ ...project, user_id: userId })
    const { error } = await supabase.from('projects').upsert(row)
    if (error) console.error('[DayFlow] projectsService.upsert:', error.message)
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', userId)
    if (error) console.error('[DayFlow] projectsService.delete:', error.message)
  },
}

// ── Bookmarks ────────────────────────────────────────────────────────────────
export const bookmarksService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data, error } = await supabase
      .from('bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) { console.error('[DayFlow] bookmarksService.getAll:', error.message); return [] }
    return (data ?? []).map(bookmarkMapper.fromDB)
  },

  async upsert(userId, bookmark) {
    if (!isSupabaseConfigured()) return
    const row = bookmarkMapper.toDB({ ...bookmark, user_id: userId })
    const { error } = await supabase.from('bookmarks').upsert(row)
    if (error) console.error('[DayFlow] bookmarksService.upsert:', error.message)
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('bookmarks').delete().eq('id', id).eq('user_id', userId)
    if (error) console.error('[DayFlow] bookmarksService.delete:', error.message)
  },
}

// ── Profile ──────────────────────────────────────────────────────────────────
export const profileService = {
  async get(userId) {
    if (!isSupabaseConfigured()) return null
    const { data, error } = await supabase
      .from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) console.error('[DayFlow] profileService.get:', error.message)
    return data
  },

  async update(userId, updates) {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...updates })
    if (error) console.error('[DayFlow] profileService.update:', error.message)
  },
}
