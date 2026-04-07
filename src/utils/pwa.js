// Utils: PWA service worker registration and install prompt handling
export function registerSW() {
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('[DayFlow] SW registration failed:', err)
    })
  })
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
