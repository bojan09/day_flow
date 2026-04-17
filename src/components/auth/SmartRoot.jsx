// Component: SmartRoot
// Purpose: The "/" route handler — sends logged-in users to /dashboard,
//          logged-out users to /welcome. Shows a minimal spinner while resolving.
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../services/supabaseClient'

export default function SmartRoot() {
  const { user, loading } = useAuth()
  const navigate          = useNavigate()

  useEffect(() => {
    // If Supabase not configured (demo mode) — go straight to welcome
    if (!isSupabaseConfigured()) {
      navigate('/welcome', { replace: true })
      return
    }

    // Wait for session to resolve
    if (loading) return

    if (user) {
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/welcome', { replace: true })
    }
  }, [user, loading, navigate])

  // Minimal loading state while session resolves
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
