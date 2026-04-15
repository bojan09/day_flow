-- DayFlow Storage Buckets
-- Run this in Supabase SQL Editor AFTER schema.sql

-- ── Voice journal recordings ───────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'voice-journals',
  'voice-journals',
  false,
  10485760,   -- 10 MB max per file
  array['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg']
)
on conflict (id) do nothing;

-- Only the owner can read/write their own recordings
create policy "Users manage own voice journals"
  on storage.objects for all
  using (
    bucket_id = 'voice-journals'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── Note attachments ───────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'note-attachments',
  'note-attachments',
  false,
  26214400,   -- 25 MB max per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf', 'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

create policy "Users manage own note attachments"
  on storage.objects for all
  using (
    bucket_id = 'note-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── Profile avatars ────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,        -- public so avatars can be displayed anywhere
  2097152,    -- 2 MB max
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Users manage own avatar"
  on storage.objects for all
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
