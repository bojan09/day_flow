-- DayFlow OAuth Provider Setup
-- Configure in: Supabase Dashboard → Authentication → Providers

-- ──────────────────────────────────────────────────────
-- GOOGLE OAUTH
-- ──────────────────────────────────────────────────────
-- 1. Go to https://console.cloud.google.com
-- 2. Create a project (or use an existing one)
-- 3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
-- 4. Application type: Web application
-- 5. Authorized redirect URIs:
--    https://your-project-id.supabase.co/auth/v1/callback
-- 6. Copy Client ID and Client Secret
-- 7. In Supabase: Authentication → Providers → Google
--    - Enable: ON
--    - Client ID: (paste from Google)
--    - Client Secret: (paste from Google)

-- ──────────────────────────────────────────────────────
-- GITHUB OAUTH
-- ──────────────────────────────────────────────────────
-- 1. Go to https://github.com/settings/developers
-- 2. New OAuth App
-- 3. Homepage URL: https://your-deployed-app.vercel.app
-- 4. Authorization callback URL:
--    https://your-project-id.supabase.co/auth/v1/callback
-- 5. Register application → copy Client ID and generate Client Secret
-- 6. In Supabase: Authentication → Providers → GitHub
--    - Enable: ON
--    - Client ID: (paste from GitHub)
--    - Client Secret: (paste from GitHub)

-- ──────────────────────────────────────────────────────
-- REDIRECT URL (add to Supabase allowed redirect URLs)
-- ──────────────────────────────────────────────────────
-- Supabase → Authentication → URL Configuration → Redirect URLs
-- Add:
--   http://localhost:5173/dashboard      (local dev)
--   https://your-deployed-app.com/dashboard  (production)

select 'OAuth configured — enable Google and GitHub in Supabase Dashboard → Auth → Providers' as status;
