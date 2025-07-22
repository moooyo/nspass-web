import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './globals.css'
import { logger } from './utils/logger'

logger.info('Main.tsx is loading...')
logger.info('Environment:', import.meta.env.MODE)
logger.info('API Base URL:', import.meta.env.VITE_API_BASE_URL)

// 初始化MSW
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  logger.info('Initializing MSW...')
  import('./init-msw').then(() => {
    logger.info('MSW initialized in development mode')
  }).catch((error) => {
    logger.warn('MSW initialization failed:', error)
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
