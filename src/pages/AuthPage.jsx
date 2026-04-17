// Page: AuthPage
// Purpose: Auth flow — sign in, sign up, magic link with Google OAuth (no GitHub)
//          Reads ?mode=signin|signup from URL to pre-select the right tab
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'

const MODES = { signin: 'signin', signup: 'signup', magic: 'magic' }

// Official Google SVG logo
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </g>
    </svg>
  )
}

export default function AuthPage() {
  const { signIn, signUp, signInWithMagicLink, signInWithProvider } = useAuth()
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()

  const [mode,     setMode]    = useState(searchParams.get('mode') || MODES.signin)
  const [email,    setEmail]   = useState('')
  const [password, setPass]    = useState('')
  const [name,     setName]    = useState('')
  const [loading,  setLoading] = useState(false)
  const [oauthLoading, setOAuth] = useState(false)
  const [error,    setError]   = useState(null)
  const [success,  setSuccess] = useState(null)

  // Sync mode from URL param if it changes
  useEffect(() => {
    const m = searchParams.get('mode')
    if (m && MODES[m]) setMode(m)
  }, [searchParams])

  const reset = () => { setError(null); setSuccess(null) }

  const handleSubmit = async (e) => {
    e.preventDefault(); reset(); setLoading(true)
    try {
      if (mode === MODES.magic) {
        const { error } = await signInWithMagicLink(email)
        if (error) throw error
        setSuccess('Magic link sent! Check your inbox.')
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
      // OAuth redirects — no navigate needed
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
      setOAuth(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo — always goes to welcome page from auth */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="font-serif text-3xl hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text)' }}
          >
            Day<em className="not-italic text-forest-500">Flow</em>
          </button>
          <p className="text-sm mt-2" style={{ color: 'var(--text-faint)' }}>
            {mode === MODES.signup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <div
          className="rounded-3xl border p-8"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor:     'var(--border)',
            boxShadow:       'var(--shadow-modal)',
          }}
        >
          {/* Google OAuth button — shown for signin and signup */}
          {isSupabaseConfigured() && mode !== MODES.magic && (
            <>
              <button
                onClick={handleGoogle}
                disabled={oauthLoading}
                className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60 mb-5"
                style={{
                  borderColor:     'var(--border)',
                  color:           'var(--text)',
                  backgroundColor: 'var(--bg)',
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
              >
                {oauthLoading
                  ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <GoogleLogo />
                }
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>or</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
              </div>
            </>
          )}

          {/* Mode tabs */}
          <div
            className="flex gap-1 rounded-xl p-1 mb-6"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            {[
              { id: MODES.signin, label: 'Sign in'   },
              { id: MODES.signup, label: 'Sign up'   },
              { id: MODES.magic,  label: 'Magic link' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setMode(tab.id); reset() }}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === MODES.signup && (
              <div>
                <label
                  className="text-xs font-medium uppercase tracking-wide block mb-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="input-base"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="input-base"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>

            {mode !== MODES.magic && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Password
                  </label>
                  {mode === MODES.signin && (
                    <button
                      type="button"
                      onClick={() => { setMode(MODES.magic); reset() }}
                      className="text-[11px] transition-colors"
                      style={{ color: 'var(--accent)' }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPass(e.target.value)}
                  placeholder={mode === MODES.signup ? 'At least 6 characters' : '••••••••'}
                  required
                  minLength={6}
                  className="input-base"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
            )}

            {/* Error / Success */}
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-600 border border-red-200 animate-fade-in">
                {error}
              </div>
            )}
            {success && (
              <div
                className="rounded-xl px-4 py-3 text-sm border animate-fade-in"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'var(--accent-mid)' }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 rounded-xl text-white font-medium transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : mode === MODES.magic  ? 'Send magic link'
                : mode === MODES.signup ? 'Create account'
                                        : 'Sign in'
              }
            </button>
          </form>

          {/* Demo mode link */}
          <div className="mt-5 pt-5 border-t text-center" style={{ borderColor: 'var(--border-soft)' }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              Try demo mode — no account needed →
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-faint)' }}>
          Your data is private and encrypted. We never share it.
        </p>
      </div>
    </div>
  )
}
