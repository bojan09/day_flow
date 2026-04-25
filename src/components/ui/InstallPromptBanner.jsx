// Component: InstallPromptBanner
// Purpose: Prompts mobile users to install DayFlow as a PWA.
//          Only shown once, dismissed state persisted in localStorage.
//          Uses the browser's beforeinstallprompt event via pwa.js utilities.
import { useState, useEffect } from 'react'
import { setupInstallPrompt, triggerInstall } from '../../utils/pwa'

const DISMISSED_KEY = 'dayflow_install_dismissed'

export default function InstallPromptBanner() {
  const [canInstall, setCanInstall] = useState(false)
  const [dismissed,  setDismissed]  = useState(() => {
    try { return !!localStorage.getItem(DISMISSED_KEY) } catch { return false }
  })

  useEffect(() => {
    // Don't show if already dismissed or already installed (standalone mode)
    if (dismissed) return
    if (window.matchMedia('(display-mode: standalone)').matches) return
    setupInstallPrompt(setCanInstall)
  }, [])

  if (!canInstall || dismissed) return null

  const handleInstall = async () => {
    const accepted = await triggerInstall()
    if (accepted) setDismissed(true)
  }

  const handleDismiss = () => {
    setDismissed(true)
    try { localStorage.setItem(DISMISSED_KEY, '1') } catch {}
  }

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 rounded-2xl border p-4 animate-slide-up"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor:     'var(--accent-mid)',
        boxShadow:       'var(--shadow-modal)',
      }}
      role="dialog"
      aria-label="Install DayFlow app"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-light)' }}
        >
          📱
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Add DayFlow to Home Screen
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Works offline · Faster access · No browser chrome
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-sm transition-colors w-6 h-6 flex items-center justify-center rounded-full"
          style={{ color: 'var(--text-faint)' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleDismiss}
          className="flex-1 py-2 rounded-xl border text-xs font-medium transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Install app
        </button>
      </div>
    </div>
  )
}
