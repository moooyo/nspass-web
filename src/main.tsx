import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './globals.css'
import { logger } from './utils/logger'
import './test-global-client' // 导入测试文件

// Environment info for development
if (import.meta.env.DEV) {
  logger.info('Environment:', import.meta.env.MODE)
  logger.info('API Base URL:', import.meta.env.VITE_API_BASE_URL)
}

// Initialize MSW in development only - 由MSWProvider管理，不在这里自动启动
if (typeof window !== 'undefined' && import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
  logger.info('MSW功能已启用，将由MSWProvider管理启动状态')
} else if (typeof window !== 'undefined' && import.meta.env.PROD) {
  logger.info('MSW disabled in production mode')
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
