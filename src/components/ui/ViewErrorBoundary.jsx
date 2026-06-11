// Component: ViewErrorBoundary
// Purpose: Isolates render errors to the active dashboard view so a crash in
//          one tab never takes down the whole dashboard shell. Theme-aware.
//          Keyed by activeTab in DashboardPage, so switching tabs remounts
//          and clears the error automatically.
import { Component } from 'react'

export default class ViewErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DayFlow] View render error:', error, errorInfo)
  }

  handleRetry = () => this.setState({ hasError: false, error: null })

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <div
          className="max-w-sm w-full rounded-2xl p-8 text-center"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="text-4xl mb-3" aria-hidden="true">⚠️</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
            This view hit an error
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-soft)' }}>
            Your data is safe. The rest of DayFlow still works — try again or
            switch to another tab.
          </p>
          {import.meta.env.DEV && this.state.error?.message && (
            <p
              className="text-xs font-mono text-left rounded-lg p-3 mb-5 break-all"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text-soft)' }}
            >
              {this.state.error.message}
            </p>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-contrast, #fff)' }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
}
