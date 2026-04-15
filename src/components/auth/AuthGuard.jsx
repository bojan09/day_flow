// Component: AuthGuard
// Purpose: Redirects unauthenticated users to /auth — skips check if Supabase not configured
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'
import { SkeletonCard } from './ui/Skeleton'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  const navigate          = useNavigate()

  useEffect(() => {
    // If Supabase not configured, always allow access (demo mode)
    if (!isSupabaseConfigured()) return
    if (!loading && !user) navigate('/auth')
  }, [user, loading, navigate])

  // Show skeleton while session loads
  if (isSupabaseConfigured() && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-full max-w-sm space-y-4">
          <SkeletonCard rows={3} />
          <SkeletonCard rows={2} />
        </div>
      </div>
    )
  }

  // Not configured (demo mode) or user is authenticated — render children
  if (!isSupabaseConfigured() || user) return children

  return null
}
