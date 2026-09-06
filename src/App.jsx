// App: Root router with smart auth-based routing
// Purpose:
//   - Logged OUT  → / shows WelcomePage (marketing)
//   - Logged IN   → / redirects to /dashboard
//   - /auth       → AuthPage (sign in / sign up)
//   - /dashboard  → DashboardPage (protected by AuthGuard)
import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import WelcomePage   from './pages/WelcomePage'
import AuthGuard     from './components/auth/AuthGuard'
import SmartRoot     from './components/auth/SmartRoot'
import { AuthProvider }  from './hooks/useAuth'
import { ToastProvider } from './utils/toast.jsx'
import ErrorBoundary    from './components/ui/ErrorBoundary'
import ViewSkeleton     from './components/ui/ViewSkeleton'

// Lazy: a logged-out visitor on /welcome or /auth should never download the
// whole authenticated dashboard bundle (18+ hooks, every core view) just to
// see the marketing page or sign-in form.
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AuthPage      = lazy(() => import('./pages/AuthPage'))

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Smart root: logged-in → /dashboard, logged-out → /welcome */}
          <Route path="/" element={<SmartRoot />} />

          {/* Public welcome/marketing page */}
          <Route path="/welcome" element={<WelcomePage />} />

          {/* Auth page — sign in / sign up */}
          <Route path="/auth" element={<Suspense fallback={<ViewSkeleton type="default" />}><AuthPage /></Suspense>} />
          <Route path="/auth/*" element={<Suspense fallback={<ViewSkeleton type="default" />}><AuthPage /></Suspense>} />

          {/* Protected dashboard */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <ErrorBoundary>
                  <Suspense fallback={<ViewSkeleton type="default" />}>
                    <DashboardPage />
                  </Suspense>
                </ErrorBoundary>
              </AuthGuard>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
