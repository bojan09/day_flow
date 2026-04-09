// App: Root router with ToastProvider wrapping all routes
import { Routes, Route } from 'react-router-dom'
import LandingPage   from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import { ToastProvider } from './utils/toast'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </ToastProvider>
  )
}
