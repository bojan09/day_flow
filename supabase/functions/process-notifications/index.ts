import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createNotificationHandler } from './handler.js'
import { buildNotificationCandidates, toDeliveryRow } from './policy.js'

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

async function materializeDueTaskReminders() {
  const now = new Date()
  const { data: preferences, error: preferencesError } = await db
    .from('notification_preferences')
    .select('*')
    .eq('enabled', true)
    .eq('task_reminders', true)
    .limit(500)
  if (preferencesError) throw preferencesError

  for (const preference of preferences ?? []) {
    const { data: tasks, error: tasksError } = await db
      .from('tasks')
      .select('id,title,reminder_at,reminder_sent,completed')
      .eq('user_id', preference.user_id)
      .eq('completed', false)
      .eq('reminder_sent', false)
      .not('reminder_at', 'is', null)
      .lte('reminder_at', now.toISOString())
      .limit(100)
    if (tasksError) throw tasksError

    const rows = buildNotificationCandidates({ preferences: preference, tasks, now })
      .map(candidate => toDeliveryRow(preference.user_id, candidate))
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
    await materializeDueTaskReminders()
    const { data, error } = await db
      .from('notification_deliveries')
      .select('id,user_id,category,source_type,source_id,idempotency_key,title,body,url')
      .eq('status', 'pending')
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
    if (candidate.source_type === 'task' && candidate.source_id) {
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
