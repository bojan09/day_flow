// Entry: main.jsx
// Purpose: App bootstrap — registers service worker, wraps app in OfflineQueueProvider
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
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
        {/* v7_startTransition and v7_relativeSplatPath were opt-in flags under
            react-router v6; both are default behaviour in v7, so the prop is
            no longer needed. */}
        <BrowserRouter>
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
