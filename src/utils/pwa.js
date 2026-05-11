// Utils: PWA service worker registration and install prompt handling
export function registerSW() {
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('[DayFlow] SW registration failed:', err)
    })
  })
}

// Listen for messages from service worker (background sync)
export function listenForSWMessages(onSyncQueue, onBackgroundSync) {
  if (!('serviceWorker' in navigator)) return
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SYNC_QUEUE')    onSyncQueue?.()
    if (event.data?.type === 'BACKGROUND_SYNC') onBackgroundSync?.()
  })
}

// Register periodic sync permission (call after user gesture)
export async function requestPeriodicSync() {
  if (!('periodicSync' in ServiceWorkerRegistration.prototype)) return false
  try {
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' })
    return status.state === 'granted'
  } catch { return false }
}

// Store the install prompt event for later use
let deferredPrompt = null

export function setupInstallPrompt(setCanInstall) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    setCanInstall(true)
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    setCanInstall(false)
  })
}

export async function triggerInstall() {
  if (!deferredPrompt) return false
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  return outcome === 'accepted'
}
