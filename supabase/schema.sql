-- DayFlow Supabase Schema
-- Run this in your Supabase SQL Editor to create all tables
-- Dashboard → SQL Editor → New Query → Paste → Run

-- ──────────────────────────────────────────────
-- Enable Row-Level Security helper
-- ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────
-- Profiles (extends auth.users)
-- ──────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text,
  avatar_url  text,
  theme       text default 'light',
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can manage own profile"
  on public.profiles for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────────────────────────────────
-- Tasks
-- ──────────────────────────────────────────────
create table if not exists public.tasks (
  id             text primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  title          text not null,
  priority       text default 'medium',
  category       text default 'Personal',
  date           text not null,
  completed      boolean default false,
  completed_at   timestamptz,
  is_focus       boolean default false,
  estimate_mins  int,
  is_recurring   boolean default false,
  recur_days     text[],
  recurring_from text,
  recur_status   text default 'active',
  recur_end_date text,
  project_id     text,
  sub_tasks      jsonb default '[]',
  notes          text default '',
  created_at     timestamptz default now()
);
alter table public.tasks enable row level security;
create policy "Users own their tasks"
  on public.tasks for all using (auth.uid() = user_id);
create index if not exists tasks_user_date on public.tasks(user_id, date);

-- ──────────────────────────────────────────────
-- Notes
-- ──────────────────────────────────────────────
create table if not exists public.notes (
  id         text primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null default 'Untitled',
  content    text default '',
  tags       text[] default '{}',
  pinned     boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.notes enable row level security;
create policy "Users own their notes"
  on public.notes for all using (auth.uid() = user_id);
create index if not exists notes_user_updated on public.notes(user_id, updated_at desc);

-- ──────────────────────────────────────────────
-- Habits
-- ──────────────────────────────────────────────
create table if not exists public.habits (
  id         text primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  icon       text default '⭐',
  frequency  text default 'daily',
  created_at timestamptz default now()
);
alter table public.habits enable row level security;
create policy "Users own their habits"
  on public.habits for all using (auth.uid() = user_id);

-- Habit completion log (sparse — only stores done days)
create table if not exists public.habit_log (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  habit_id   text not null,
  date_key   text not null,
  done       boolean default true,
  unique(user_id, habit_id, date_key)
);
alter table public.habit_log enable row level security;
create policy "Users own their habit log"
  on public.habit_log for all using (auth.uid() = user_id);
create index if not exists habit_log_lookup on public.habit_log(user_id, habit_id, date_key);

-- ──────────────────────────────────────────────
-- Goals
-- ──────────────────────────────────────────────
create table if not exists public.goals (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  title        text not null,
  description  text default '',
  type         text default 'Yearly',
  category     text default 'Personal',
  target_date  text,
  milestones   jsonb default '[]',
  completed    boolean default false,
  created_at   timestamptz default now()
);
alter table public.goals enable row level security;
create policy "Users own their goals"
  on public.goals for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- Moods
-- ──────────────────────────────────────────────
create table if not exists public.moods (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  date_key   text not null,
  score      int not null check (score between 1 and 5),
  note       text default '',
  logged_at  timestamptz default now(),
  unique(user_id, date_key)
);
alter table public.moods enable row level security;
create policy "Users own their moods"
  on public.moods for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- Ideas
-- ──────────────────────────────────────────────
create table if not exists public.ideas (
  id             text primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  title          text not null,
  description    text default '',
  category       text default 'Other',
  status         text default 'Raw',
  stars          int default 0,
  tags           text[] default '{}',
  linked_goal_id text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
alter table public.ideas enable row level security;
create policy "Users own their ideas"
  on public.ideas for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- Projects
-- ──────────────────────────────────────────────
create table if not exists public.projects (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  description text default '',
  category    text default 'Personal',
  status      text default 'Active',
  color       text default '#3B6B4B',
  due_date    text,
  created_at  timestamptz default now()
);
alter table public.projects enable row level security;
create policy "Users own their projects"
  on public.projects for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- Bookmarks
-- ──────────────────────────────────────────────
create table if not exists public.bookmarks (
  id         text primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  url        text not null,
  title      text not null,
  note       text default '',
  tags       text[] default '{}',
  read       boolean default false,
  remind_at  timestamptz,
  created_at timestamptz default now()
);
alter table public.bookmarks enable row level security;
create policy "Users own their bookmarks"
  on public.bookmarks for all using (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- Key-value store for all other data
-- (intentions, gratitude, moods, water, affirmations, etc.)
-- ──────────────────────────────────────────────
create table if not exists public.user_data (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  key        text not null,
  value      jsonb not null,
  updated_at timestamptz default now(),
  unique(user_id, key)
);
alter table public.user_data enable row level security;
create policy "Users own their data"
  on public.user_data for all using (auth.uid() = user_id);
create index if not exists user_data_lookup on public.user_data(user_id, key);
