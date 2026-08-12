import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const sql = readFileSync(new URL('./202608120001_dayflow_v2_core.sql', import.meta.url), 'utf8')

test('all V2 user tables enable RLS and constrain writes', () => {
  for (const table of ['capture_inbox', 'notification_preferences', 'notification_deliveries']) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, 'i'))
    const tablePolicy = new RegExp(`on public\\.${table}[\\s\\S]*?with check \\(auth\\.uid\\(\\) = user_id\\)`, 'i')
    assert.match(sql, tablePolicy)
  }
})

test('migration never drops data-bearing tables', () => {
  assert.doesNotMatch(sql, /drop\s+table/i)
  assert.doesNotMatch(sql, /truncate\s/i)
})

test('task columns match the client mapper contract', () => {
  for (const column of ['due_time', 'custom_mins', 'reminder_time', 'reminder_at', 'reminder_sent', 'recur_status', 'recur_end_date']) {
    assert.match(sql, new RegExp(`add column if not exists ${column}\\b`, 'i'))
  }
})

test('notification delivery logical keys are unique per user', () => {
  assert.match(sql, /unique\s*\(user_id,\s*logical_key\)/i)
})
