// Page: AuthPage
// Purpose: Auth flow — sign in, sign up, magic link. Google OAuth only (no GitHub).
//          ?mode=signin|signup|magic pre-selects the tab.
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'
import GoogleButton    from '../components/auth/GoogleButton'
import AuthDivider     from '../components/auth/AuthDivider'
import AuthFormField   from '../components/auth/AuthFormField'
import PasswordInput   from '../components/auth/PasswordInput'

const MODES = { signin: 'signin', signup: 'signup', magic: 'magic' }

const MODE_TABS = [
  { id: 'signin', label: 'Sign in'    },
  { id: 'signup', label: 'Sign up'    },
  { id: 'magic',  label: 'Magic link' },
]

export default function AuthPage() {
  const { signIn, signUp, signInWithMagicLink, signInWithProvider } = useAuth()
  const navigate        = useNavigate()
  const [searchParams]  = useSearchParams()

  const [mode,         setMode]    = useState(searchParams.get('mode') || MODES.signin)
  const [email,        setEmail]   = useState('')
  const [password,     setPass]    = useState('')
  const [name,         setName]    = useState('')
  const [loading,      setLoading] = useState(false)
  const [oauthLoading, setOAuth]   = useState(false)
  const [error,        setError]   = useState(null)
  const [success,      setSuccess] = useState(null)
  const [fieldErrors,  setFieldErrors] = useState({})

  useEffect(() => {
    const m = searchParams.get('mode')
    if (m && MODES[m]) setMode(m)
  }, [searchParams])

  const reset = () => { setError(null); setSuccess(null); setFieldErrors({}) }

  // Per-field validation
  const validate = () => {
    const errs = {}
    if (!email.trim())             errs.email    = 'Email is required'
    if (mode === MODES.signup && !name.trim())
                                   errs.name     = 'Name is required'
    if (mode !== MODES.magic && password.length < 6)
                                   errs.password = 'At least 6 characters'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    reset()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === MODES.magic) {
        const { error } = await signInWithMagicLink(email)
        if (error) throw error
        setSuccess(`Magic link sent to ${email}. Check your inbox.`)
      } else if (mode === MODES.signup) {
        const { error } = await signUp(email, password, name)
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then sign in.')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setOAuth(true); reset()
    try {
      const { error } = await signInWithProvider('google')
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
      setOAuth(false)
    }
  }

  const switchMode = (id) => {
    setMode(id)
    reset()
    setEmail('')
    setPass('')
    setName('')
  }

  const isSignIn = mode === MODES.signin
  const isMagic  = mode === MODES.magic

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/welcome')}
            className="font-serif text-3xl hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text)' }}
          >
            Day<em className="not-italic [color:var(--accent)]">Flow</em>
          </button>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-faint)' }}>
            {mode === MODES.signup
              ? 'Create your free account'
              : mode === MODES.magic
              ? 'Sign in with a magic link'
              : 'Welcome back'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-8"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor:     'var(--border)',
            boxShadow:       'var(--shadow-modal)',
          }}
        >
          {/* Google button — visible for signin and signup */}
          {isSupabaseConfigured() && !isMagic && (
            <>
              <GoogleButton onClick={handleGoogle} loading={oauthLoading} />
              <AuthDivider label="or continue with email" />
            </>
          )}

          {/* Mode tabs */}
          <div
            className="flex gap-0.5 rounded-xl p-1 mb-6"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            {MODE_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => switchMode(tab.id)}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={mode === tab.id
                  ? { backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)', color: 'var(--text)' }
                  : { color: 'var(--text-faint)' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Name — signup only */}
            {mode === MODES.signup && (
              <AuthFormField
                label="Full name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Smith"
                autoComplete="name"
                autoFocus={mode === MODES.signup}
                error={fieldErrors.name}
              />
            )}

            {/* Email */}
            <AuthFormField
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus={mode !== MODES.signup}
              error={fieldErrors.email}
            />

            {/* Password — not for magic link */}
            {!isMagic && (
              <PasswordInput
                label="Password"
                value={password}
                onChange={e => setPass(e.target.value)}
                showStrength={mode === MODES.signup}
                required
                minLength={6}
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                error={fieldErrors.password}
                onForgot={isSignIn ? () => switchMode(MODES.magic) : undefined}
              />
            )}

            {/* Magic link helper text */}
            {isMagic && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                We'll send a secure one-click sign-in link to your email. No password needed.
              </p>
            )}

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 animate-fade-in">
                <span className="text-red-500 text-sm flex-shrink-0 mt-0.5">⚠</span>
                <p className="text-sm text-red-700 leading-snug">{error}</p>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl border animate-fade-in"
                style={{
                  backgroundColor: 'var(--accent-light)',
                  borderColor:     'var(--accent-mid)',
                  color:           'var(--accent)',
                }}
              >
                <span className="text-sm flex-shrink-0 mt-0.5">✓</span>
                <p className="text-sm leading-snug">{success}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full py-3 rounded-xl text-white font-medium text-sm transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === MODES.signup ? 'Creating account…' : mode === MODES.magic ? 'Sending link…' : 'Signing in…'}
                </span>
              ) : (
                mode === MODES.magic  ? 'Send magic link'
                : mode === MODES.signup ? 'Create account'
                                        : 'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Below-card links */}
        <div className="mt-5 flex flex-col items-center gap-3">
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {mode === MODES.signup
              ? 'Already have an account? '
              : 'New to DayFlow? '}
            <button
              onClick={() => switchMode(mode === MODES.signup ? MODES.signin : MODES.signup)}
              className="font-medium transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              {mode === MODES.signup ? 'Sign in' : 'Create a free account'}
            </button>
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs transition-colors"
            style={{ color: 'var(--text-faint)' }}
            onMouseOver={e => e.target.style.color = 'var(--text-muted)'}
            onMouseOut={e => e.target.style.color = 'var(--text-faint)'}
          >
            Try without an account →
          </button>
        </div>

        <p className="text-center text-[11px] mt-6" style={{ color: 'var(--text-faint)' }}>
          By continuing you agree to our{' '}
          <a href="#" className="underline underline-offset-2">Terms</a>{' '}
          and{' '}
          <a href="#" className="underline underline-offset-2">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
