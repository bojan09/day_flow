// App: Root — AuthProvider + ToastProvider + routing
import { Routes, Route } from 'react-router-dom'
import LandingPage   from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import AuthPage      from './pages/AuthPage'
import AuthGuard     from './components/auth/AuthGuard'
import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from './utils/toast.jsx'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/"          element={<LandingPage />} />
          <Route path="/auth"      element={<AuthPage />} />
          <Route path="/dashboard" element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          } />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
