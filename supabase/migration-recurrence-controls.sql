-- Migration: recurrence controls (status + end date)
alter table public.tasks add column if not exists recur_status   text default 'active';
alter table public.tasks add column if not exists recur_end_date text;
