// Component: AuthGuard
// Purpose: Protects /dashboard. Redirects to /auth if session is gone.
//          Handles both initial load AND mid-session token expiry.
//          Demo mode (no Supabase) always passes through.
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../services/supabaseClient'
import { SkeletonCard } from '../ui/Skeleton'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  const navigate          = useNavigate()

  useEffect(() => {
    // Demo mode — always allow, no check needed
    if (!isSupabaseConfigured()) return

    // Session resolved and no user → redirect to sign-in
    if (!loading && !user) {
      navigate('/auth?mode=signin', { replace: true })
    }
  }, [user, loading, navigate])

  // Show skeleton while Supabase resolves the session
  if (isSupabaseConfigured() && loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <div className="w-full max-w-sm space-y-4">
          <SkeletonCard rows={3} />
          <SkeletonCard rows={2} />
        </div>
      </div>
    )
  }

  // Authenticated (or demo mode) — render children
  if (!isSupabaseConfigured() || user) return children

  // Signed out — render nothing while redirect happens
  return null
}
