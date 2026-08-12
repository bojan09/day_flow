-- DayFlow V2 core: additive and safe to re-run. No production rows are removed.
create extension if not exists pgcrypto;

alter table public.tasks add column if not exists due_time text default '';
alter table public.tasks add column if not exists custom_mins integer;
alter table public.tasks add column if not exists reminder_time text default '';
alter table public.tasks add column if not exists reminder_at timestamptz;
alter table public.tasks add column if not exists reminder_sent boolean not null default false;
alter table public.tasks add column if not exists recur_status text not null default 'active';
alter table public.tasks add column if not exists recur_end_date text;

create index if not exists tasks_pending_reminders
  on public.tasks (reminder_at)
  where completed = false and reminder_sent = false and reminder_at is not null;

create table if not exists public.capture_inbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (length(trim(text)) > 0),
  inferred_type text not null default 'inbox'
    check (inferred_type in ('task', 'reminder', 'note', 'idea', 'inbox')),
  fields jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'converted', 'archived')),
  converted_type text check (converted_type is null or converted_type in ('task', 'note', 'idea')),
  converted_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists capture_inbox_user_status_created
  on public.capture_inbox (user_id, status, created_at desc);

alter table public.capture_inbox enable row level security;
drop policy if exists "Users own capture inbox" on public.capture_inbox;
create policy "Users own capture inbox" on public.capture_inbox
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  task_reminders boolean not null default true,
  morning_planning boolean not null default true,
  upcoming_tasks boolean not null default true,
  overdue_summary boolean not null default true,
  habit_reminders boolean not null default true,
  routine_reminders boolean not null default true,
  focus_reminders boolean not null default true,
  evening_review boolean not null default true,
  inactivity_nudges boolean not null default false,
  morning_time time not null default '08:00',
  evening_time time not null default '20:00',
  quiet_start time not null default '22:00',
  quiet_end time not null default '07:00',
  timezone text not null default 'UTC',
  last_opened_at timestamptz,
  last_planning_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;
drop policy if exists "Users own notification preferences" on public.notification_preferences;
create policy "Users own notification preferences" on public.notification_preferences
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logical_key text not null,
  category text not null,
  source_type text,
  source_id text,
  bucket text not null,
  onesignal_message_id text,
  idempotency_key uuid not null default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  last_error text,
  attempted_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, logical_key)
);

create index if not exists notification_deliveries_recent
  on public.notification_deliveries (user_id, created_at desc);
create index if not exists notification_deliveries_pending
  on public.notification_deliveries (status, attempted_at)
  where status in ('pending', 'failed');

alter table public.notification_deliveries enable row level security;
drop policy if exists "Users own notification deliveries" on public.notification_deliveries;
create policy "Users own notification deliveries" on public.notification_deliveries
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

do $$
begin
  if to_regclass('public.push_subscriptions') is not null then
    comment on table public.push_subscriptions is
      'Deprecated by DayFlow V2 OneSignal integration. Retained for non-destructive rollback and later operator cleanup.';
  end if;
end $$;
