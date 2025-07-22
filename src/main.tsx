import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './globals.css'
import { logger } from './utils/logger'

console.log('🚀 main.tsx 开始加载...')
console.log('🔍 环境信息:', {
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
})

logger.info('Main.tsx is loading...')
logger.info('Environment:', import.meta.env.MODE)
logger.info('API Base URL:', import.meta.env.VITE_API_BASE_URL)

// 检查root元素是否存在
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('❌ Root元素未找到!')
} else {
  console.log('✅ Root元素找到:', rootElement)
}

// 初始化MSW
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  logger.info('Initializing MSW...')
  
  import('./init-msw').then(() => {
    logger.info('MSW initialized in development mode')
  }).catch((error) => {
    logger.warn('MSW initialization failed:', error)
  })
}

console.log('🎯 开始渲染React应用...')

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    // 在开发环境中禁用 StrictMode 以减少不必要的重复渲染
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
  console.log('✅ React应用渲染成功!')
} catch (error) {
  const err = error as Error;
  console.error('❌ React应用渲染失败:', err)
}
