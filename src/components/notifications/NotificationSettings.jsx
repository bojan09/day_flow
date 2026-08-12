import { useEffect, useId, useState } from 'react'
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences'
import { isValidNotificationTime, isValidTimezone } from '../../services/notificationPreferences'
import { oneSignalClient } from '../../services/oneSignalClient'

const CATEGORIES = [
  ['taskReminders', 'Task reminders'],
  ['morningPlanning', 'Morning planning'],
  ['upcomingTasks', 'Upcoming tasks'],
  ['overdueSummary', 'Overdue summary'],
  ['habitReminders', 'Habits'],
  ['routineReminders', 'Routines'],
  ['focusReminders', 'Focus'],
  ['eveningReview', 'Evening review'],
  ['inactivityNudges', 'Inactivity nudges'],
]
const TIMES = [
  ['morningTime', 'Morning time'],
  ['eveningTime', 'Evening time'],
  ['quietStart', 'Quiet starts'],
  ['quietEnd', 'Quiet ends'],
]

export default function NotificationSettings() {
  const id = useId()
  const { preferences, update } = useNotificationPreferences()
  const [state, setState] = useState(oneSignalClient.getState())
  const [message, setMessage] = useState('')
  const [timezone, setTimezone] = useState(preferences.timezone)

  useEffect(() => oneSignalClient.subscribe(setState), [])
  useEffect(() => setTimezone(preferences.timezone), [preferences.timezone])

  const enable = async () => {
    setMessage('')
    try {
      const next = await oneSignalClient.requestPermission()
      if (next.permission === 'granted' && next.subscribed) {
        update({ enabled: true })
        setMessage('Notifications are enabled for this device.')
      } else {
        setMessage('Permission was not granted. You can change this in your browser site settings.')
      }
    } catch (error) {
      setMessage(`OneSignal could not be enabled: ${error.message}`)
    }
  }

  const saveTimezone = () => {
    if (!isValidTimezone(timezone)) {
      setMessage('Enter a valid IANA timezone, for example Europe/Skopje.')
      return
    }
    update({ timezone })
    setMessage('Timezone saved.')
  }

  return (
    <section className="rounded-2xl p-5" style={{ backgroundColor: 'var(--surface)' }} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="font-semibold">Notifications</h3>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        Contextual reminders powered only by OneSignal. Permission is requested after you choose Enable.
      </p>
      <p className="text-xs mt-2" aria-live="polite">Status: {state.status} · permission: {state.permission}</p>
      <div className="flex flex-wrap gap-3 items-center mt-3">
        <button type="button" onClick={enable} disabled={state.status === 'unconfigured'} className="rounded-xl px-3 py-2 text-white disabled:opacity-40" style={{ backgroundColor: 'var(--accent)' }}>
          Enable notifications
        </button>
        <label className="flex gap-2 text-sm items-center">
          <input type="checkbox" checked={preferences.enabled} disabled={state.permission !== 'granted'} onChange={event => update({ enabled: event.target.checked })} />
          Send contextual notifications
        </label>
      </div>
      {state.status === 'unconfigured' && <p className="text-xs mt-2">Add VITE_ONESIGNAL_APP_ID to configure web push.</p>}
      {message && <p className="text-xs mt-2" role="status">{message}</p>}

      <fieldset disabled={!preferences.enabled} className="mt-4 disabled:opacity-50">
        <legend className="sr-only">Notification categories and schedule</legend>
        <div className="grid sm:grid-cols-2 gap-2">
          {CATEGORIES.map(([key, label]) => (
            <label key={key} className="flex gap-2 text-sm">
              <input type="checkbox" checked={!!preferences[key]} onChange={event => update({ [key]: event.target.checked })} />
              {label}
            </label>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {TIMES.map(([key, label]) => (
            <label key={key} htmlFor={`${id}-${key}`} className="text-xs">
              {label}
              <input id={`${id}-${key}`} type="time" value={preferences[key]} onChange={event => isValidNotificationTime(event.target.value) && update({ [key]: event.target.value })} className="block w-full rounded-lg border p-2 mt-1" />
            </label>
          ))}
          <label htmlFor={`${id}-timezone`} className="text-xs sm:col-span-2">
            Timezone
            <input id={`${id}-timezone`} value={timezone} onChange={event => setTimezone(event.target.value)} onBlur={saveTimezone} className="block w-full rounded-lg border p-2 mt-1" aria-describedby={`${id}-timezone-help`} />
          </label>
          <p id={`${id}-timezone-help`} className="text-xs sm:col-span-2" style={{ color: 'var(--text-muted)' }}>Use an IANA timezone such as Europe/Skopje.</p>
        </div>
      </fieldset>
    </section>
  )
}
