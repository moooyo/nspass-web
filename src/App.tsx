import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import { ThemeProvider } from './components/providers/ThemeProvider';
import { MockProvider } from './components/providers/MockProvider';
import { MockControlPanel } from './components/MockControlPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import EnvInitializer from './components/EnvInitializer';
import ModernMainLayout from './components/ModernMainLayout';
import ModernLoginPage from './login/ModernLoginPage';
// import LoginPageBasic from './login/LoginPageBasic';
import CallbackPageNew from './login/CallbackPageNew';
import TestPage from './TestPage';
import ModernTestPage from './pages/ModernTestPage';
import TailwindTestPage from './pages/TailwindTestPage';
import OptimizationTestPage from './pages/OptimizationTestPage';
import { Toaster } from './components/ui/toaster';
import { useAuthStore } from './stores/auth';
import { logger } from './utils/logger';
import './utils/dev-tools'; // 初始化开发工具

// 应用启动日志
if (typeof window !== 'undefined') {
  logger.info('🚀 NSPass Web 应用启动 (现代化完整版本)');
  logger.info('🔍 环境信息:');
  logger.info('  NODE_ENV:', import.meta.env.MODE);
  logger.info('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'undefined');
  logger.info('  Build time:', new Date().toISOString());
}

function App() {
  const { initialize } = useAuthStore();
  
  // Initialize auth store on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  logger.info('App component rendering with complete layout...');
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MockProvider>
          <EnvInitializer />
          <Routes>
          {/* 测试页面 */}
          <Route path="/test" element={<TestPage />} />
          <Route path="/modern-test" element={<ModernTestPage />} />
          <Route path="/tailwind-test" element={<TailwindTestPage />} />
          <Route path="/optimization-test" element={<OptimizationTestPage />} />
          
          {/* 登录相关路由 */}
          <Route path="/login" element={<ModernLoginPage />} />
          <Route path="/login/callback" element={<CallbackPageNew />} />

          {/* 主应用路由 - 现代化完整布局 */}
          <Route path="/*" element={<ModernMainLayout />} />
        </Routes>
        <Toaster />
        <MockControlPanel />
      </MockProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
