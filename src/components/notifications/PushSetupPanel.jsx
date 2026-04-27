// Component: PushSetupPanel
// Purpose: Enable/disable push notifications — subscribes device and saves to Supabase
import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import { pushService } from '../../services/pushNotificationService'
import { useAuth } from '../../hooks/useAuth'

export default function PushSetupPanel() {
  const { user }                    = useAuth()
  const [subscribed, setSubscribed] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [supported,  setSupported]  = useState(true)

  useEffect(() => {
    setSupported(pushService.isSupported())
    pushService.isSubscribed().then(setSubscribed)
  }, [])

  const handleToggle = async () => {
    if (!user) return
    setLoading(true); setError(null)
    try {
      if (subscribed) {
        await pushService.unsubscribe(user.id)
        setSubscribed(false)
      } else {
        const { error: err } = await pushService.subscribe(user.id)
        if (err) throw new Error(err)
        setSubscribed(true)
        // Test notification
        pushService.sendViaEdgeFunction(user.id, '🎉 Push enabled!', 'DayFlow will now send you daily reminders.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!supported) {
    return (
      <Card>
        <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>
          🔔 Push Notifications
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Push notifications aren't supported in this browser. Try Chrome or Edge.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>
            🔔 Push Notifications
          </p>
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            {subscribed ? 'Push notifications are enabled' : 'Get daily reminders and streak alerts'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
            {subscribed
              ? 'You\'ll receive your morning briefing every day at 8am.'
              : 'Daily task reminders, habit streak milestones, and more.'}
          </p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className="flex-shrink-0 relative w-12 h-6 rounded-full transition-colors duration-200 disabled:opacity-50"
          style={{ backgroundColor: subscribed ? 'var(--accent)' : 'var(--border)' }}
        >
          <div
            className="absolute top-0.5 w-5 h-5 [background-color:var(--surface)] rounded-full shadow transition-transform duration-200"
            style={{ transform: subscribed ? 'translateX(24px)' : 'translateX(2px)' }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
      </div>
    </Card>
  )
}
