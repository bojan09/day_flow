// Entry: main.jsx
// Purpose: App bootstrap — registers service worker, wraps app in OfflineQueueProvider
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ui/ErrorBoundary'
import './index.css'
import { registerSW } from './utils/pwa'
import { useOfflineQueue, OfflineQueueContext } from './hooks/useOfflineQueue'

registerSW()

function Root() {
  const offlineQueue = useOfflineQueue()

  return (
    <ErrorBoundary>
      <OfflineQueueContext.Provider value={offlineQueue}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </OfflineQueueContext.Provider>
    </ErrorBoundary>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
