// Service Worker: DayFlow PWA
// Purpose: Offline-first caching — shell cache-first, API network-first.
//          v6: Fixed Response body clone race condition.

const SHELL_CACHE   = 'dayflow-shell-v4'
const DYNAMIC_CACHE = 'dayflow-dynamic-v4'

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
  )
})

// ── Activate ───────────────────────────────────────────────────────────────────
self.addEventListener('activate', async event => {
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
      fetch(request)
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

  // ── Navigations / index.html — NETWORK-FIRST ─────────────────────────────
  // Cache-first here caused stale deploys: an old cached index.html points at
  // hashed chunk files deleted by the new deploy, breaking the app.
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(SHELL_CACHE).then(cache => cache.put(request, clone))
          }
          return response
        })
        .catch(async () =>
          (await caches.match(request)) || caches.match('/offline.html')
        )
    )
    return
  }

  // ── Hashed build assets (/assets/*) — cache-first, immutable ─────────────
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(SHELL_CACHE).then(cache => cache.put(request, clone))
          }
          return response
        })
      )
    )
    return
  }

  // ── Other same-origin static files — stale-while-revalidate ──────────────
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(SHELL_CACHE).then(cache => cache.put(request, clone))
          }
          return response
        }).catch(() => caches.match('/offline.html'))
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

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
