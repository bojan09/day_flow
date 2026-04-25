// Entry: main.jsx
// Purpose: App bootstrap — registers service worker, wraps app in OfflineQueueProvider
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { registerSW } from './utils/pwa'
import { useOfflineQueue, OfflineQueueContext } from './hooks/useOfflineQueue'

registerSW()

function Root() {
  const offlineQueue = useOfflineQueue()

  return (
    <OfflineQueueContext.Provider value={offlineQueue}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </OfflineQueueContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
