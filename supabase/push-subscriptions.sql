-- Push notification subscriptions
-- Safe to re-run: every statement is idempotent.

create table if not exists public.push_subscriptions (
  id           bigserial primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  subscription jsonb not null,               -- full PushSubscription object
  device_name  text,                          -- optional user-friendly name
  created_at   timestamptz default now()
);

-- The endpoint is what identifies a device, so it is pulled out of the JSON
-- into its own column. A plain column (rather than an expression index) is what
-- lets PostgREST use it as an upsert conflict target, so re-enabling push on the
-- same device updates its row instead of adding another one.
alter table public.push_subscriptions
  add column if not exists endpoint text
  generated always as (subscription ->> 'endpoint') stored;

-- One row per device. This must be a unique INDEX, not a table-level
-- UNIQUE(...) containing an expression — Postgres rejects that with
--   42601: syntax error at or near "("
-- which is what the first version of this file hit.
create unique index if not exists push_sub_user_endpoint
  on public.push_subscriptions (user_id, endpoint);

create index if not exists push_sub_user
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- create policy has no "if not exists", so drop first to stay re-runnable.
drop policy if exists "Users manage own push subscriptions" on public.push_subscriptions;
create policy "Users manage own push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
