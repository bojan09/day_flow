// Edge Function: send-push
// Purpose: Supabase Edge Function that sends push notifications to subscribed users
// Deploy with: supabase functions deploy send-push

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { userId, title, body, url = '/dashboard' } = await req.json()

    if (!userId || !title) {
      return new Response(JSON.stringify({ error: 'userId and title required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get all push subscriptions for this user
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)

    if (error) throw error
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // VAPID keys — set these as Edge Function secrets
    const vapidPublicKey  = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!

    const payload = JSON.stringify({ title, body, url, icon: '/icon-192.png', badge: '/icon-192.png' })

    let sent = 0
    const expired: string[] = []

    for (const { subscription } of subs) {
      try {
        // Use the web-push standard — Deno compatible
        // Rows written before the jsonb fix hold a stringified subscription.
        const sub = typeof subscription === 'string' ? JSON.parse(subscription) : subscription
        const response = await fetch(sub.endpoint, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/octet-stream',
            'TTL':           '86400',
          },
          body: payload,
        })

        if (response.status === 410 || response.status === 404) {
          expired.push(sub.endpoint)
        } else {
          sent++
        }
      } catch (e) {
        console.error('Push send failed:', e)
      }
    }

    // Remove expired subscriptions
    if (expired.length > 0) {
      for (const endpoint of expired) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .contains('subscription', JSON.stringify({ endpoint }))
      }
    }

    return new Response(JSON.stringify({ sent, expired: expired.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
