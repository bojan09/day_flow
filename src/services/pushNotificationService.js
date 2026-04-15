// Service: pushNotificationService
// Purpose: Web Push API subscription management + Edge Function trigger
import { supabase, isSupabaseConfigured } from './supabaseClient'

// Your VAPID public key — generate with: npx web-push generate-vapid-keys
// Then set VAPID_PUBLIC_KEY in Supabase Edge Function secrets
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export const pushService = {
  /** Check if push is supported in this browser */
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  },

  async getPermission() {
    if (!this.isSupported()) return 'unsupported'
    return Notification.permission
  },

  /** Request permission and subscribe to push */
  async subscribe(userId) {
    if (!this.isSupported() || !isSupabaseConfigured() || !VAPID_PUBLIC_KEY) {
      return { error: 'Push not available — check VITE_VAPID_PUBLIC_KEY' }
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { error: 'Permission denied' }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // Save subscription to Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id:      userId,
          subscription: JSON.stringify(subscription),
          device_name:  navigator.userAgent.slice(0, 100),
        })

      if (error) throw error
      return { subscription }
    } catch (err) {
      return { error: err.message }
    }
  },

  /** Remove push subscription for this device */
  async unsubscribe(userId) {
    if (!this.isSupported() || !isSupabaseConfigured()) return

    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .filter('subscription->>endpoint', 'eq', sub.endpoint)
      }
    } catch (err) {
      console.error('Unsubscribe failed:', err)
    }
  },

  /** Check if this device is currently subscribed */
  async isSubscribed() {
    if (!this.isSupported()) return false
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      return !!sub
    } catch { return false }
  },

  /** Trigger a push via the Edge Function (server-side) */
  async sendViaEdgeFunction(userId, title, body, url = '/dashboard') {
    if (!isSupabaseConfigured()) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId, title, body, url }),
    })
  },
}
