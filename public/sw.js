// Service Worker: DayFlow v4.5
// Strategy:
//   - App shell (HTML, JS, CSS, fonts): Cache-first
//   - Supabase API calls: Network-first, fall back to cache (read-only)
//   - Everything else: Network-first, fall back to app shell
const CACHE_VERSION  = 'dayflow-v4.5'
const SHELL_CACHE    = `${CACHE_VERSION}-shell`
const DATA_CACHE     = `${CACHE_VERSION}-data`

// App shell assets cached on install
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// ── Install — cache app shell ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// ── Activate — clear old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== SHELL_CACHE && k !== DATA_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// ── Fetch — tiered caching strategy ──────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:') return

  // ── Supabase API — network-first, cache successful responses ──────────
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request.clone())
        .then(response => {
          if (response.ok) {
            caches.open(DATA_CACHE).then(cache => cache.put(request, response.clone()))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // ── Google Fonts — cache-first ─────────────────────────────────────────
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          caches.open(SHELL_CACHE).then(cache => cache.put(request, response.clone()))
          return response
        })
      })
    )
    return
  }

  // ── App shell & static assets — cache-first ────────────────────────────
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request.clone())
          .then(response => {
            if (response.ok) {
              caches.open(SHELL_CACHE).then(cache => cache.put(request, response.clone()))
            }
            return response
          })
          .catch(() => caches.match('/index.html'))
      })
    )
    return
  }

  // ── Everything else — network-first ───────────────────────────────────
  event.respondWith(
    fetch(request).catch(() => caches.match('/index.html'))
  )
})

// ── Background sync (if supported) ───────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'dayflow-sync') {
    // Signal all clients to attempt a queue replay
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SYNC_QUEUE' }))
      )
    )
  }
})

// ── Push notification received ────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  let data = {}
  try { data = event.data.json() } catch { data = { title: 'DayFlow', body: event.data.text() } }
  const {
    title = 'DayFlow', body = '',
    icon  = '/icon-192.png',
    badge = '/icon-192.png',
    url   = '/dashboard',
  } = data
  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon, badge,
      data:    { url },
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open',    title: 'Open DayFlow' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  )
})

// ── Notification click ────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          c.navigate(url)
          return c.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
