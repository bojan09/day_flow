// Service: supabaseClient
// Purpose: Initialise and export the single Supabase client used across the app
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn(
    '[DayFlow] Supabase env vars missing — running in localStorage-only mode.\n' +
    'Create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = url && key
  ? createClient(url, key, {
      auth: {
        persistSession:  true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const isSupabaseConfigured = () => !!supabase
