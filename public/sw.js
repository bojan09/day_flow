// Service Worker: DayFlow PWA
// Purpose: Offline-first caching — shell cache-first, API network-first.
//          v6: Fixed Response body clone race condition.

const SHELL_CACHE   = 'dayflow-shell-v3'
const DYNAMIC_CACHE = 'dayflow-dynamic-v3'

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/favicon.svg',
]

// ── Install ────────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate ───────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== SHELL_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )

  // Register periodic sync if supported
  if ('periodicSync' in self.registration) {
    try {
      await self.registration.periodicSync.register('dayflow-refresh', {
        minInterval: 30 * 60 * 1000, // 30 minutes
      })
    } catch (e) {
      // Periodic sync not permitted — silently skip
    }
  }
})

// Periodic background sync handler
self.addEventListener('periodicsync', event => {
  if (event.tag === 'dayflow-refresh') {
    event.waitUntil(
      // Notify app to re-fetch data when it next opens
      self.clients.matchAll({ type: 'window' }).then(clients =>
        clients.forEach(client => client.postMessage({ type: 'BACKGROUND_SYNC' }))
      )
    )
  }
})

// ── Fetch ──────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  // ── Supabase API — network-first, no caching ─────────────────────────────
  if (url.hostname.includes('supabase.co') || url.hostname.includes('anthropic.com')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    )
    return
  }

  // ── Google Fonts — cache-first ───────────────────────────────────────────
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          // Clone IMMEDIATELY before any async operation consumes the body
          const clone = response.clone()
          caches.open(SHELL_CACHE).then(cache => cache.put(request, clone))
          return response
        })
      })
    )
    return
  }

  // ── App shell & static assets — cache-first, update in background ────────
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        // Clone the request before passing to fetch (request body can only be read once)
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) {
            // Clone IMMEDIATELY — before any await/then that could consume the body
            const clone = response.clone()
            caches.open(SHELL_CACHE).then(cache => cache.put(request, clone))
          }
          return response
        }).catch(() => caches.match('/offline.html'))

        // Return cached immediately, but refresh cache in background
        return cached || fetchPromise
      })
    )
    return
  }

  // ── Everything else — network with cache fallback ────────────────────────
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone))
        }
        return response
      })
      .catch(() => caches.match(request) || caches.match('/offline.html'))
  )
})

// ── Push notifications ─────────────────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'DayFlow', body: 'Time to check in!' }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    '/icon-192.png',
      badge:   '/icon-192.png',
      vibrate: [200, 100, 200],
      data:    { url: data.url || '/dashboard' },
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      const url = event.notification.data?.url || '/dashboard'
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
