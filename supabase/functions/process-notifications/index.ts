import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createNotificationHandler } from './handler.js'
import {
  buildContextualCandidates,
  buildNotificationCandidates,
  dailySendAllowed,
  toDeliveryRow,
} from './policy.js'

const env = {
  CRON_SECRET: Deno.env.get('CRON_SECRET') ?? '',
  ONESIGNAL_APP_ID: Deno.env.get('ONESIGNAL_APP_ID') ?? '',
  ONESIGNAL_REST_API_KEY: Deno.env.get('ONESIGNAL_REST_API_KEY') ?? '',
  PUBLIC_APP_URL: Deno.env.get('PUBLIC_APP_URL') ?? '',
}
const db = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const CONTEXT_KEYS = ['routines', 'routine_log', 'focus_session', 'daily_priorities']
const CATEGORY_PRIORITY = ['upcoming_task', 'focus_reminder', 'morning_planning', 'evening_review', 'overdue_summary', 'habit_reminder', 'routine_reminder', 'inactivity_nudge']

async function materializeNotificationCandidates() {
  const now = new Date()
  const { data: preferences, error: preferencesError } = await db
    .from('notification_preferences')
    .select('*')
    .eq('enabled', true)
    .limit(500)
  if (preferencesError) throw preferencesError

  for (const preference of preferences ?? []) {
    const sinceDay = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const sinceHour = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    const [tasksResult, habitsResult, habitLogResult, contextResult, deliveryResult] = await Promise.all([
      db.from('tasks').select('id,title,date,due_time,reminder_at,reminder_sent,completed')
        .eq('user_id', preference.user_id).eq('completed', false).limit(500),
      db.from('habits').select('id,name,frequency').eq('user_id', preference.user_id).limit(100),
      db.from('habit_log').select('habit_id,date_key,done').eq('user_id', preference.user_id).gte('date_key', sinceDay.slice(0, 10)),
      db.from('user_data').select('key,value').eq('user_id', preference.user_id).in('key', CONTEXT_KEYS),
      db.from('notification_deliveries').select('sent_at').eq('user_id', preference.user_id).eq('status', 'sent').gte('sent_at', sinceDay),
    ])
    const firstError = [tasksResult, habitsResult, habitLogResult, contextResult, deliveryResult].find(result => result.error)?.error
    if (firstError) throw firstError

    const context = Object.fromEntries((contextResult.data ?? []).map(row => [row.key, row.value]))
    const explicit = preference.task_reminders
      ? buildNotificationCandidates({ preferences: preference, tasks: tasksResult.data ?? [], now })
      : []
    const contextual = buildContextualCandidates({
      preferences: preference,
      tasks: tasksResult.data ?? [],
      habits: habitsResult.data ?? [],
      habitLog: habitLogResult.data ?? [],
      routines: context.routines ?? [],
      routineLog: context.routine_log ?? {},
      focusSession: context.focus_session ?? null,
      dailyPriorities: context.daily_priorities ?? {},
      now,
    }).sort((a, b) => CATEGORY_PRIORITY.indexOf(a.category) - CATEGORY_PRIORITY.indexOf(b.category))

    const sent = deliveryResult.data ?? []
    const allowedContext = dailySendAllowed({
      sentToday: sent.length,
      sentLastHour: sent.filter(row => row.sent_at >= sinceHour).length,
    }) ? contextual.slice(0, 1) : []
    const rows = [...explicit, ...allowedContext].map(candidate => toDeliveryRow(preference.user_id, candidate))
    if (rows.length) {
      const { error } = await db
        .from('notification_deliveries')
        .upsert(rows, { onConflict: 'user_id,logical_key', ignoreDuplicates: true })
      if (error) throw error
    }
  }
}

const repository = {
  async candidates() {
    await materializeNotificationCandidates()
    const { data, error } = await db
      .from('notification_deliveries')
      .select('id,user_id,category,source_type,source_id,idempotency_key,title,body,url')
      .in('status', ['pending', 'failed'])
      .limit(100)
    if (error) throw error
    return (data ?? []).map(row => ({
      ...row,
      userId: row.user_id,
      title: row.title,
      body: row.body,
      url: env.PUBLIC_APP_URL ? new URL(row.url, env.PUBLIC_APP_URL).href : row.url,
      idempotencyKey: row.idempotency_key,
    }))
  },
  async markSent(candidate, messageId) {
    const sentAt = new Date().toISOString()
    const { error } = await db.from('notification_deliveries').update({
      status: 'sent',
      onesignal_message_id: messageId,
      attempted_at: sentAt,
      sent_at: sentAt,
    }).eq('id', candidate.id)
    if (error) throw error
    if (candidate.category === 'task_reminder' && candidate.source_type === 'task' && candidate.source_id) {
      const { error: taskError } = await db.from('tasks')
        .update({ reminder_sent: true })
        .eq('id', candidate.source_id)
        .eq('user_id', candidate.user_id)
      if (taskError) throw taskError
    }
  },
  async markFailed(candidate, errorMessage) {
    await db.from('notification_deliveries').update({
      status: 'failed',
      last_error: errorMessage,
      attempted_at: new Date().toISOString(),
    }).eq('id', candidate.id)
  },
}

Deno.serve(createNotificationHandler({ env, repository }))
