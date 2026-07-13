-- Migration: task reminders
-- Adds per-task reminder scheduling columns. Run in Supabase SQL editor.
-- reminder_at is the field the check-reminders cron function actually queries —
-- it's a precomputed absolute UTC timestamp (derived client-side from the
-- task's date + reminder_time in the user's local timezone), so no server-side
-- timezone math is needed.

alter table public.tasks
  add column if not exists reminder_time text,
  add column if not exists reminder_at timestamptz,
  add column if not exists reminder_sent boolean not null default false;

create index if not exists tasks_pending_reminders
  on public.tasks (reminder_at)
  where reminder_sent = false and completed = false;
