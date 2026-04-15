// Service: supabaseDataService
// Purpose: CRUD helpers for each data type — wraps Supabase client calls
// Falls back gracefully when Supabase is not configured
import { supabase, isSupabaseConfigured } from './supabaseClient'

// ── Generic key-value store (intentions, gratitude, water, etc.) ──────────────
export const kvService = {
  async get(userId, key) {
    if (!isSupabaseConfigured()) return null
    const { data } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', userId)
      .eq('key', key)
      .maybeSingle()
    return data?.value ?? null
  },

  async set(userId, key, value) {
    if (!isSupabaseConfigured()) return
    await supabase.from('user_data').upsert(
      { user_id: userId, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    )
  },
}

// ── Tasks ──────────────────────────────────────────────────────────────────────
export const tasksService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return data ?? []
  },

  async upsert(userId, task) {
    if (!isSupabaseConfigured()) return
    await supabase.from('tasks').upsert({ ...task, user_id: userId })
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId)
  },
}

// ── Notes ──────────────────────────────────────────────────────────────────────
export const notesService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    return data ?? []
  },

  async upsert(userId, note) {
    if (!isSupabaseConfigured()) return
    await supabase.from('notes').upsert({ ...note, user_id: userId })
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    await supabase.from('notes').delete().eq('id', id).eq('user_id', userId)
  },
}

// ── Habits ─────────────────────────────────────────────────────────────────────
export const habitsService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return { habits: [], log: {} }
    const [{ data: habits }, { data: logRows }] = await Promise.all([
      supabase.from('habits').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('habit_log').select('habit_id,date_key,done').eq('user_id', userId),
    ])
    const log = {}
    for (const row of logRows ?? []) {
      log[`${row.habit_id}_${row.date_key}`] = row.done
    }
    return { habits: habits ?? [], log }
  },

  async upsertHabit(userId, habit) {
    if (!isSupabaseConfigured()) return
    await supabase.from('habits').upsert({ ...habit, user_id: userId })
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
    await supabase.from('habit_log').upsert(
      { user_id: userId, habit_id: habitId, date_key: dateKey, done },
      { onConflict: 'user_id,habit_id,date_key' }
    )
  },
}

// ── Goals ──────────────────────────────────────────────────────────────────────
export const goalsService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data } = await supabase
      .from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return data ?? []
  },

  async upsert(userId, goal) {
    if (!isSupabaseConfigured()) return
    await supabase.from('goals').upsert({ ...goal, user_id: userId })
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    await supabase.from('goals').delete().eq('id', id).eq('user_id', userId)
  },
}

// ── Ideas ──────────────────────────────────────────────────────────────────────
export const ideasService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data } = await supabase
      .from('ideas').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return data ?? []
  },

  async upsert(userId, idea) {
    if (!isSupabaseConfigured()) return
    await supabase.from('ideas').upsert({ ...idea, user_id: userId })
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    await supabase.from('ideas').delete().eq('id', id).eq('user_id', userId)
  },
}

// ── Projects ───────────────────────────────────────────────────────────────────
export const projectsService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data } = await supabase
      .from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return data ?? []
  },

  async upsert(userId, project) {
    if (!isSupabaseConfigured()) return
    await supabase.from('projects').upsert({ ...project, user_id: userId })
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    await supabase.from('projects').delete().eq('id', id).eq('user_id', userId)
  },
}

// ── Bookmarks ──────────────────────────────────────────────────────────────────
export const bookmarksService = {
  async getAll(userId) {
    if (!isSupabaseConfigured()) return []
    const { data } = await supabase
      .from('bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return data ?? []
  },

  async upsert(userId, bookmark) {
    if (!isSupabaseConfigured()) return
    await supabase.from('bookmarks').upsert({ ...bookmark, user_id: userId })
  },

  async delete(userId, id) {
    if (!isSupabaseConfigured()) return
    await supabase.from('bookmarks').delete().eq('id', id).eq('user_id', userId)
  },
}

// ── Profile ────────────────────────────────────────────────────────────────────
export const profileService = {
  async get(userId) {
    if (!isSupabaseConfigured()) return null
    const { data } = await supabase
      .from('profiles').select('*').eq('id', userId).maybeSingle()
    return data
  },

  async update(userId, updates) {
    if (!isSupabaseConfigured()) return
    await supabase.from('profiles').upsert({ id: userId, ...updates })
  },
}
