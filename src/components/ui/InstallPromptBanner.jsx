// Component: InstallPromptBanner
// Purpose: PWA install prompt — shown once per user, dismissed state in Supabase.
import { useState, useEffect } from 'react'
import { setupInstallPrompt, triggerInstall } from '../../utils/pwa'
import { usePersistedState } from '../../hooks/usePersistedState'

export default function InstallPromptBanner() {
  const [canInstall, setCanInstall] = useState(false)
  const [dismissed, setDismissed] = usePersistedState('pwa_install_dismissed', false)

  useEffect(() => {
    if (dismissed) return
    if (window.matchMedia('(display-mode: standalone)').matches) return
    setupInstallPrompt(setCanInstall)
  }, [dismissed])

  if (!canInstall || dismissed) return null

  const handleInstall = async () => {
    const accepted = await triggerInstall()
    if (accepted) setDismissed(true)
  }

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[var(--z-nav)] rounded-2xl border p-4 animate-slide-up"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor:     'var(--accent-mid)',
        boxShadow:       'var(--shadow-modal)',
      }}
      role="dialog"
      aria-label="Install DayFlow app"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-light)' }}
        >📱</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Add DayFlow to Home Screen
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Works offline · Faster access · No browser chrome
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-sm"
          style={{ color: 'var(--text-faint)' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Dismiss"
        >✕</button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setDismissed(true)}
          className="flex-1 py-2 rounded-xl border text-xs font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >Not now</button>
        <button
          onClick={handleInstall}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >Install app</button>
      </div>
    </div>
  )
}
