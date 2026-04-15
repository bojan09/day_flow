// Hook: useProfile
// Purpose: Fetch and update the authenticated user's profile from Supabase
import { useState, useEffect } from 'react'
import { profileService } from '../services/supabaseDataService'
import { isSupabaseConfigured } from '../services/supabaseClient'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) { setLoading(false); return }
    profileService.get(userId).then(data => {
      setProfile(data)
      setLoading(false)
    })
  }, [userId])

  const updateProfile = async (updates) => {
    if (!userId) return
    await profileService.update(userId, updates)
    setProfile(prev => ({ ...prev, ...updates }))
  }

  const displayName = profile?.name
    || profile?.email?.split('@')[0]
    || 'You'

  const initials = displayName
    .split(' ')
    .map(w => w[0]?.toUpperCase())
    .slice(0, 2)
    .join('')

  return { profile, loading, updateProfile, displayName, initials }
}
