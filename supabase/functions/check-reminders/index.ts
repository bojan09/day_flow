// Edge Function: check-reminders
// Purpose: Cron-triggered (every 1 minute) — finds tasks whose reminder time
// has arrived and haven't been notified yet, sends a push per task via the
// existing send-push function, and marks them sent (idempotency guard).
// Schedule with: Supabase Dashboard → Database → Cron Jobs
// Cron expression: * * * * *  (every minute)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const nowIso = new Date().toISOString()

  const { data: dueTasks, error } = await supabase
    .from('tasks')
    .select('id, user_id, title, category')
    .lte('reminder_at', nowIso)
    .eq('reminder_sent', false)
    .eq('completed', false)
    .limit(500)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!dueTasks || dueTasks.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
  }

  let sent = 0

  for (const task of dueTasks) {
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          userId: task.user_id,
          title:  `⏰ ${task.title}`,
          body:   task.category || 'DayFlow reminder',
          url:    `/dashboard?openTask=${task.id}`,
        }),
      })
      sent++
    } catch (e) {
      console.error(`Failed to send reminder for task ${task.id}:`, e)
    }

    // Mark sent regardless of push success — a permanently-undeliverable
    // reminder (e.g. all subscriptions expired) should not retry every minute.
    await supabase
      .from('tasks')
      .update({ reminder_sent: true })
      .eq('id', task.id)
  }

  return new Response(JSON.stringify({ sent, checked: dueTasks.length }), { status: 200 })
})
