// App: Root router with smart auth-based routing
// Purpose:
//   - Logged OUT  → / shows WelcomePage (marketing)
//   - Logged IN   → / redirects to /dashboard
//   - /auth       → AuthPage (sign in / sign up)
//   - /dashboard  → DashboardPage (protected by AuthGuard)
import { Routes, Route, Navigate } from 'react-router-dom'
import WelcomePage   from './pages/WelcomePage'
import DashboardPage from './pages/DashboardPage'
import AuthPage      from './pages/AuthPage'
import AuthGuard     from './components/auth/AuthGuard'
import SmartRoot     from './components/auth/SmartRoot'
import { AuthProvider }  from './hooks/useAuth'
import { ToastProvider } from './utils/toast.jsx'
import ErrorBoundary    from './components/ui/ErrorBoundary'
import { useAuth } from './hooks/useAuth'
import { useOfflineQueue, OfflineQueueContext } from './hooks/useOfflineQueue'

function AuthenticatedServices({ children }) {
  const { user } = useAuth()
  const offlineQueue = useOfflineQueue(user?.id || 'demo')
  return <OfflineQueueContext.Provider value={offlineQueue}>{children}</OfflineQueueContext.Provider>
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedServices>
        <ToastProvider>
        <Routes>
          {/* Smart root: logged-in → /dashboard, logged-out → /welcome */}
          <Route path="/" element={<SmartRoot />} />

          {/* Public welcome/marketing page */}
          <Route path="/welcome" element={<WelcomePage />} />

          {/* Auth page — sign in / sign up */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/*" element={<AuthPage />} />

          {/* Protected dashboard */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <ErrorBoundary>
                  <DashboardPage />
                </ErrorBoundary>
              </AuthGuard>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ToastProvider>
      </AuthenticatedServices>
    </AuthProvider>
  )
}
