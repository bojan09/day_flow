// Component: ErrorBoundary
// Purpose: Catches unhandled React render errors anywhere in the tree.
//          Shows a friendly recovery screen instead of a blank white page.
//          Logs the error for debugging. Reset button remounts the failed subtree.
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DayFlow] Uncaught render error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const message = this.state.error?.message || 'Unknown error'
    const isDev   = import.meta.env.DEV

    return (
      <div
        style={{
          minHeight:       '100vh',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          padding:         '24px',
          backgroundColor: 'var(--bg)',
          fontFamily:      'Outfit, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth:        '400px',
            width:           '100%',
            backgroundColor: 'var(--surface)',
            border:          '1px solid var(--border)',
            borderRadius:    '24px',
            padding:         '40px 32px',
            textAlign:       'center',
            boxShadow:       'var(--shadow-modal)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>

          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
            Something went wrong
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            DayFlow hit an unexpected error. Your data is safe — this is a display issue only.
          </p>

          {/* Show error detail in dev mode */}
          {isDev && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border:          '1px solid #FECACA',
              borderRadius:    '12px',
              padding:         '12px',
              marginBottom:    '20px',
              textAlign:       'left',
            }}>
              <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#991B1B', wordBreak: 'break-all', margin: 0 }}>
                {message}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => this.handleReset()}
              style={{
                flex:            1,
                padding:         '12px',
                backgroundColor: 'var(--accent)',
                color:           'white',
                border:          'none',
                borderRadius:    '100px',
                fontSize:        '14px',
                fontWeight:      600,
                cursor:          'pointer',
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                flex:            1,
                padding:         '12px',
                backgroundColor: 'transparent',
                color:           'var(--text-muted)',
                border:          '1px solid var(--border)',
                borderRadius:    '100px',
                fontSize:        '14px',
                cursor:          'pointer',
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    )
  }
}
