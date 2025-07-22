import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './globals.css'

console.log('Main.tsx is loading...');
console.log('Environment:', import.meta.env.MODE);
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// 初始化MSW
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('Initializing MSW...');
  import('./init-msw').then(() => {
    console.log('MSW initialized in development mode');
  }).catch((error) => {
    console.warn('MSW initialization failed:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
