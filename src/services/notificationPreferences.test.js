import assert from 'node:assert/strict'
import test from 'node:test'
import { notificationPreferencesFromDb, notificationPreferencesToDb } from './notificationPreferences.js'

test('maps notification preferences between React and Supabase shapes', () => {
  const client = { enabled: true, taskReminders: false, morningTime: '09:15', timezone: 'Europe/Skopje' }
  const row = notificationPreferencesToDb('user-1', client)
  assert.deepEqual(row, {
    user_id: 'user-1',
    enabled: true,
    task_reminders: false,
    morning_time: '09:15',
    timezone: 'Europe/Skopje',
  })
  assert.deepEqual(notificationPreferencesFromDb(row), client)
})
