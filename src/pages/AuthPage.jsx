// Page: AuthPage
// Purpose: Full auth — sign up, sign in, magic link, Google + GitHub OAuth
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'

const MODES = { signin: 'signin', signup: 'signup', magic: 'magic' }

function OAuthButton({ provider, icon, label, onClick }) {
  const [loading, setLoading] = useState(false)
  return (
    <button
      onClick={async () => { setLoading(true); await onClick(); setLoading(false) }}
      disabled={loading}
      className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
      style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg)' }}
      onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
      onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : <span className="text-lg">{icon}</span>
      }
      {label}
    </button>
  )
}

export default function AuthPage() {
  const { signIn, signUp, signInWithMagicLink, signInWithProvider } = useAuth()
  const navigate = useNavigate()

  const [mode,     setMode]    = useState(MODES.signin)
  const [email,    setEmail]   = useState('')
  const [password, setPass]    = useState('')
  const [name,     setName]    = useState('')
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState(null)
  const [success,  setSuccess] = useState(null)

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
        setSuccess('Account created! Check your email to confirm.')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')}
            className="font-serif text-3xl hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text)' }}>
            Day<em className="not-italic text-forest-500">Flow</em>
          </button>
          <p className="text-sm mt-2" style={{ color: 'var(--text-faint)' }}>
            {mode === MODES.signup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <div className="rounded-3xl border p-8 space-y-5"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-modal)' }}>

          {/* OAuth buttons — only show for signin/signup modes */}
          {isSupabaseConfigured() && mode !== MODES.magic && (
            <>
              <div className="space-y-2.5">
                <OAuthButton
                  provider="google"
                  icon="🔵"
                  label="Continue with Google"
                  onClick={() => signInWithProvider('google')}
                />
                <OAuthButton
                  provider="github"
                  icon="⚫"
                  label="Continue with GitHub"
                  onClick={() => signInWithProvider('github')}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>or with email</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
              </div>
            </>
          )}

          {/* Mode tabs */}
          <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {[
              { id: MODES.signin, label: 'Sign in'  },
              { id: MODES.signup, label: 'Sign up'  },
              { id: MODES.magic,  label: '✉ Magic'  },
            ].map(tab => (
              <button key={tab.id} onClick={() => { setMode(tab.id); reset() }}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={mode === tab.id
                  ? { backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-card)', color: 'var(--text)' }
                  : { color: 'var(--text-faint)' }
                }>{tab.label}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === MODES.signup && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Your name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith" className="input-base"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
            )}

            <div>
              <label className="text-xs font-medium uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoFocus className="input-base"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
            </div>

            {mode !== MODES.magic && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Password</label>
                  {mode === MODES.signin && (
                    <button type="button" onClick={() => setMode(MODES.magic)}
                      className="text-[11px] transition-colors" style={{ color: 'var(--accent)' }}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <input type="password" value={password} onChange={e => setPass(e.target.value)}
                  placeholder={mode === MODES.signup ? 'At least 6 characters' : '••••••••'}
                  required minLength={6} className="input-base"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              </div>
            )}

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm bg-red-50 text-red-600 border border-red-200 animate-fade-in">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl px-4 py-3 text-sm border animate-fade-in"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'var(--accent-mid)' }}>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading || !email}
              className="w-full py-3 rounded-xl text-white font-medium transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}>
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : mode === MODES.magic  ? 'Send magic link'
                : mode === MODES.signup ? 'Create account'
                                        : 'Sign in'
              }
            </button>
          </form>

          {/* Demo mode */}
          <div className="pt-4 border-t text-center" style={{ borderColor: 'var(--border-soft)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-faint)' }}>No account yet?</p>
            <button onClick={() => navigate('/dashboard')}
              className="text-xs font-medium transition-colors" style={{ color: 'var(--accent)' }}>
              Try demo mode (local only) →
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-faint)' }}>
          Your data is private and encrypted.
        </p>
      </div>
    </div>
  )
}
