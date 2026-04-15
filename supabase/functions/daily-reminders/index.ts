// Edge Function: daily-reminders
// Purpose: Scheduled function that runs every morning to send daily task reminders
// Schedule with: Supabase Dashboard → Database → Cron Jobs
// Cron expression: 0 8 * * *  (every day at 8am UTC)

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

  const today = new Date().toISOString().split('T')[0]

  // Find all users who have tasks due today and have push subscriptions
  const { data: users } = await supabase
    .from('tasks')
    .select('user_id, title')
    .eq('date', today)
    .eq('completed', false)
    .limit(1000)

  if (!users || users.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
  }

  // Group tasks by user
  const byUser: Record<string, string[]> = {}
  for (const row of users) {
    if (!byUser[row.user_id]) byUser[row.user_id] = []
    byUser[row.user_id].push(row.title)
  }

  let totalSent = 0

  for (const [userId, taskTitles] of Object.entries(byUser)) {
    const count = taskTitles.length
    const preview = taskTitles.slice(0, 2).join(', ') + (count > 2 ? ` +${count - 2} more` : '')

    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          userId,
          title: `☀️ Good morning — ${count} task${count > 1 ? 's' : ''} today`,
          body:  preview,
          url:   '/dashboard',
        }),
      })
      totalSent++
    } catch (e) {
      console.error(`Failed to send reminder to ${userId}:`, e)
    }
  }

  return new Response(JSON.stringify({ sent: totalSent, users: Object.keys(byUser).length }), { status: 200 })
})
