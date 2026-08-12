import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'
import { scopedStorage } from '../services/storage'
import { storageScope } from '../services/scopedStorage'
import { isSupabaseConfigured } from '../services/supabaseClient'
import { notificationPreferencesService } from '../services/supabaseDataService'

export const NOTIFICATION_DEFAULTS = {
  enabled: false,
  taskReminders: true,
  morningPlanning: true,
  upcomingTasks: true,
  overdueSummary: true,
  habitReminders: false,
  routineReminders: true,
  focusReminders: false,
  eveningReview: true,
  inactivityNudges: false,
  morningTime: '08:00',
  eveningTime: '20:00',
  quietStart: '22:00',
  quietEnd: '07:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
}

export function useNotificationPreferences() {
  const { user } = useAuth()
  const configured = isSupabaseConfigured()
  const scope = storageScope(user?.id, configured)
  const [preferences, setPreferences] = useState(() => ({
    ...NOTIFICATION_DEFAULTS,
    ...scopedStorage.get(scope, 'notification_preferences', {}),
  }))

  useEffect(() => {
    let active = true
    const cached = scopedStorage.get(scope, 'notification_preferences', {})
    setPreferences({ ...NOTIFICATION_DEFAULTS, ...cached })
    if (!configured || !user?.id) return () => { active = false }

    notificationPreferencesService.get(user.id).then(result => {
      if (!active || !result.ok || !result.value) return
      const next = { ...NOTIFICATION_DEFAULTS, ...result.value }
      scopedStorage.set(scope, 'notification_preferences', next)
      setPreferences(next)
    })
    return () => { active = false }
  }, [configured, scope, user?.id])

  const update = useMemo(() => updates => {
    setPreferences(previous => {
      const next = { ...previous, ...updates }
      scopedStorage.set(scope, 'notification_preferences', next)
      if (configured && user?.id) {
        notificationPreferencesService.set(user.id, next).catch(error => {
          console.error('[DayFlow] Failed to save notification preferences:', error.message)
        })
      }
      return next
    })
  }, [configured, scope, user?.id])

  return { preferences, update }
}
