-- Push notification subscriptions table
-- Add this to your Supabase SQL Editor (run after schema.sql)

create table if not exists public.push_subscriptions (
  id           bigserial primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  subscription jsonb not null,               -- full PushSubscription object
  device_name  text,                         -- optional user-friendly name
  created_at   timestamptz default now(),
  unique(user_id, (subscription->>'endpoint'))
);

alter table public.push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on public.push_subscriptions for all using (auth.uid() = user_id);

create index if not exists push_sub_user on public.push_subscriptions(user_id);
