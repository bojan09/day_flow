// Hook: useAuth
// Purpose: Supabase authentication state — session, user, login, logout, signup
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'
import { unsubscribeAll } from '../services/realtimeService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setUser(session?.user ?? null); setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session); setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, name = '') => {
    return supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
  }

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signInWithMagicLink = async (email) => {
    return supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/dashboard` } })
  }

  const signInWithProvider = async (provider) => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  const signOut = async () => {
    unsubscribeAll()   // clean up all real-time channels first
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('Not authenticated') }
    return supabase.from('profiles').upsert({ id: user.id, ...updates }).select().single()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithMagicLink, signInWithProvider, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
