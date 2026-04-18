// Component: SmartRoot
// Purpose: "/" route handler — decides where to send the user exactly once.
//          Uses a ref to prevent double-navigation on auth state re-renders.
//          Logged-in  → /dashboard
//          Logged-out → /welcome
//          Demo mode  → /welcome
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../services/supabaseClient'

export default function SmartRoot() {
  const { user, loading } = useAuth()
  const navigate          = useNavigate()
  const navigatedRef      = useRef(false)

  useEffect(() => {
    // Already navigated — don't run again on re-render
    if (navigatedRef.current) return

    // Demo mode — always go to welcome immediately
    if (!isSupabaseConfigured()) {
      navigatedRef.current = true
      navigate('/welcome', { replace: true })
      return
    }

    // Still loading Supabase session — wait
    if (loading) return

    // Session resolved — redirect once
    navigatedRef.current = true
    navigate(user ? '/dashboard' : '/welcome', { replace: true })

  }, [user, loading, navigate])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <span
          className="font-serif text-3xl"
          style={{ color: 'var(--text)' }}
        >
          Day<em className="not-italic text-forest-500">Flow</em>
        </span>
        <span
          className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--accent)' }}
        />
      </div>
    </div>
  )
}
