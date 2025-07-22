import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './globals.css'
import { logger } from './utils/logger'

// Environment info for development
if (import.meta.env.DEV) {
  logger.info('Environment:', import.meta.env.MODE)
  logger.info('API Base URL:', import.meta.env.VITE_API_BASE_URL)
}

// Initialize MSW in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  logger.info('Initializing MSW...')
  
  import('./init-msw').then(() => {
    logger.info('MSW initialized in development mode')
  }).catch((error) => {
    logger.warn('MSW initialization failed:', error)
  })
}

// Render React application
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  import.meta.env.DEV ? (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  ) : (
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
)
