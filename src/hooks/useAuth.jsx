// Hook: useAuth
// Purpose: Supabase auth state — session, user, sign-in/out methods.
//          Gracefully no-ops when Supabase is not configured (demo mode).
//          signOut always redirects to /welcome after clearing session.
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'
import { unsubscribeAll } from '../services/realtimeService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [session, setSession] = useState(null)
  // Only show loading if Supabase is configured — demo mode skips it
  const [loading,      setLoading]      = useState(isSupabaseConfigured())
  const [recoveryMode, setRecoveryMode] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for all auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        // PASSWORD_RECOVERY fires when user clicks the reset link in their email
        // Flag this so AuthPage can show the update-password form
        if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true)
        if (event === 'USER_UPDATED')      setRecoveryMode(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Auth methods ────────────────────────────────────────────────────────────

  const signUp = async (email, password, name = '') => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
  }

  const signIn = async (email, password) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signInWithMagicLink = async (email) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
  }

  const signInWithProvider = async (provider) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  // signOut clears realtime channels + session, then navigates to /welcome.
  // Components should call this and NOT navigate themselves — navigation
  // is centralised here so it's consistent everywhere sign-out is triggered.
  const signOut = async () => {
    unsubscribeAll()
    if (supabase) await supabase.auth.signOut()
    // Hard redirect so all React state is reset cleanly
    window.location.replace('/welcome')
  }

  const resetPassword = async (email) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=update-password`,
    })
  }

  const updatePassword = async (newPassword) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.updateUser({ password: newPassword })
  }

  const resendVerification = async (email) => {
    if (!supabase) return { error: new Error('Supabase not configured') }
    return supabase.auth.resend({ type: 'signup', email })
  }

  const updateProfile = async (updates) => {
    if (!supabase || !user) return { error: new Error('Not available') }
    return supabase.from('profiles').upsert({ id: user.id, ...updates }).select().single()
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithMagicLink,
      signInWithProvider,
      signOut,
      updateProfile,
      resetPassword,
      updatePassword,
      resendVerification,
      recoveryMode,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
