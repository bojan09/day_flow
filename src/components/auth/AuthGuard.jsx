// Component: AuthGuard
// Purpose: Protects /dashboard — redirects to /auth if not signed in.
//          In demo mode (no Supabase), always allows access.
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../services/supabaseClient'
import { SkeletonCard } from '../ui/Skeleton'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  const navigate          = useNavigate()

  useEffect(() => {
    if (!isSupabaseConfigured()) return      // demo mode — always allow
    if (!loading && !user) {
      navigate('/auth?mode=signin', { replace: true })
    }
  }, [user, loading, navigate])

  // Show skeleton while session resolves
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

  // Demo mode or authenticated user — render the app
  if (!isSupabaseConfigured() || user) return children

  return null
}
