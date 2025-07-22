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

// 注入环境变量 - 在构建时确定
if (typeof window !== 'undefined') {
  const env = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
    NODE_ENV: import.meta.env.MODE || 'production'
  };
  (window as any).__ENV__ = env;
  console.log('🌍 运行时环境变量已注入:', env);
  
  // 调试信息脚本
  console.log('🚀 NSPass Web 应用启动');
  console.log('🔍 环境信息:');
  console.log('  NODE_ENV:', import.meta.env.MODE);
  console.log('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'undefined');
  console.log('  Build time:', new Date().toISOString());
  console.log('  Platform: Vite + Cloudflare Workers');
}

function App() {
  console.log('App component rendering...');
  
  return (
    <ThemeProvider>
      <MSWProvider>
        <AntdProvider>
          <EnvInitializer />
          <Routes>
            <Route path="/login" element={<LoginPageFixed />} />
            <Route path="/login/callback" element={<CallbackPage />} />
            <Route 
              path="/" 
              element={<Navigate to="/home" replace />} 
            />
            <Route path="/home" element={<MainLayoutFixed />} />
            <Route path="/dashboard" element={<MainLayoutFixed />} />
            <Route path="/user" element={<MainLayoutFixed />} />
            <Route path="/forward_rules" element={<MainLayoutFixed />} />
            <Route path="/rules" element={<MainLayoutFixed />} />
            <Route path="/egress" element={<MainLayoutFixed />} />
            <Route path="/iptables" element={<MainLayoutFixed />} />
            <Route path="/routes" element={<MainLayoutFixed />} />
            <Route path="/website" element={<MainLayoutFixed />} />
            <Route path="/users" element={<MainLayoutFixed />} />
            <Route path="/user_groups" element={<MainLayoutFixed />} />
            <Route path="/groups" element={<MainLayoutFixed />} />
            <Route path="/servers" element={<MainLayoutFixed />} />
            <Route path="/dns_config" element={<MainLayoutFixed />} />
            <Route path="/dns" element={<MainLayoutFixed />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AntdProvider>
      </MSWProvider>
    </ThemeProvider>
  );
}

export default App;
