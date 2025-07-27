import { Routes, Route, Navigate } from 'react-router-dom';
import { MSWProvider } from './components/MSWProvider';
import { AntdProvider } from './components/AntdProvider';
import { ThemeProvider } from './components/hooks/useTheme';
import EnvInitializer from './components/EnvInitializer';
// import MainLayout from './components/MainLayout';
// import SimpleMainLayout from './components/SimpleMainLayout';
import MainLayoutFixed from './components/MainLayoutFixed';
// import SimpleLoginPage from './login/SimpleLoginPage';
import LoginPageFixed from './login/LoginPageFixed';
import CallbackPage from './login/CallbackPage';
import { logger } from './utils/logger';

// 注入环境变量 - 在构建时确定
if (typeof window !== 'undefined') {
  const env = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
    NODE_ENV: import.meta.env.MODE || 'production'
  };
  (window as any).__ENV__ = env;
  logger.info('🌍 运行时环境变量已注入:', env);
  
  // 调试信息脚本
  logger.info('🚀 NSPass Web 应用启动');
  logger.info('🔍 环境信息:');
  logger.info('  NODE_ENV:', import.meta.env.MODE);
  logger.info('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'undefined');
  logger.info('  Build time:', new Date().toISOString());
  logger.info('  Platform: Vite + Cloudflare Workers');
}

function App() {
  console.log('App component rendering...');
  
  // Always wrap with MSWProvider for consistency
  return (
    <MSWProvider>
      <ThemeProvider>
        <AntdProvider>
          <EnvInitializer />
          <Routes>
            {/* 登录相关路由 */}
            <Route path="/login" element={<LoginPageFixed />} />
            <Route path="/login/callback" element={<CallbackPage />} />
            
            {/* 主应用路由 - 使用嵌套路由，包含认证检查 */}
            <Route path="/*" element={<MainLayoutFixed />} />
          </Routes>
        </AntdProvider>
      </ThemeProvider>
    </MSWProvider>
  );
}

export default App;
