import { Routes, Route } from 'react-router-dom';

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
import './utils/dev-tools'; // 初始化开发工具

// 应用启动日志
if (typeof window !== 'undefined') {
  logger.info('🚀 NSPass Web 应用启动');
  logger.info('🔍 环境信息:');
  logger.info('  NODE_ENV:', import.meta.env.MODE);
  logger.info('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'undefined');
  logger.info('  Build time:', new Date().toISOString());
}

function App() {
  logger.info('App component rendering...');
  
  return (
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
  );
}

export default App;
