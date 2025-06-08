'use client';

import { createContext, useEffect, useState } from 'react';
import { MockToggle } from './MockToggle';
import { MSWContextType } from './types';
import { initMSW } from '../init-msw';

// 创建Mock状态的Context
export const MSWContext = createContext<MSWContextType>({
  enabled: true,
  setEnabled: () => {}
});

// localStorage键名
const MOCK_ENABLED_KEY = 'nspass-mock-enabled';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  // 确保在客户端渲染
  const [isClient, setIsClient] = useState(false);
  const [mswStatus, setMswStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [mockEnabled, setMockEnabled] = useState<boolean>(true);

  // 使用useEffect确保只在客户端执行
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // 确保仅在客户端执行
    if (!isClient) {
      return;
    }

    // 在客户端第一次渲染时设置状态
    setMswStatus('loading');

    const initializeMSW = async () => {
      // 只在开发模式下启动MSW
      if (process.env.NODE_ENV === 'development') {
        try {
          // 检查LocalStorage中的Mock状态
          const storedMockEnabled = localStorage.getItem(MOCK_ENABLED_KEY);
          const shouldEnableMock = storedMockEnabled !== null ? storedMockEnabled === 'true' : true;
          
          console.log('MSW初始化: 当前Mock状态 =', shouldEnableMock ? '启用' : '禁用');
          
          // 更新状态
          setMockEnabled(shouldEnableMock);
          
          // 如果应该启用Mock，则启动MSW
          if (shouldEnableMock) {
            console.log('MSW初始化: 开始导入模块并初始化');
            const success = await initMSW();
            console.log('MSW初始化: 初始化结果 =', success ? '成功' : '失败');
            
            if (success) {
              console.log('🚀 MSW 已启动并准备就绪');
            } else {
              console.error('MSW 初始化失败');
              setMswStatus('error');
              return;
            }
          } else {
            console.log('⏹️ MSW 未启动 (已禁用)');
          }
          
          setMswStatus('success');
        } catch (error) {
          console.error('MSW 启动失败:', error);
          setMswStatus('error');
        }
      } else {
        // 生产环境不使用MSW
        setMswStatus('success');
      }
    };

    initializeMSW();
  }, [isClient]);

  // 监听mockEnabled状态变化
  useEffect(() => {
    // 确保在客户端并且避免初始化时触发
    if (isClient && mswStatus !== 'loading') {
      localStorage.setItem(MOCK_ENABLED_KEY, String(mockEnabled));
    }
  }, [mockEnabled, mswStatus, isClient]);

  // 服务器端渲染时，不显示任何加载或错误UI
  if (!isClient) {
    return (
      <MSWContext.Provider value={{ enabled: true, setEnabled: () => {} }}>
        {children}
      </MSWContext.Provider>
    );
  }

  // 在开发环境中，等待MSW准备就绪再渲染应用
  if (process.env.NODE_ENV === 'development' && mswStatus === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        🔄 正在初始化 Mock Service Worker...
      </div>
    );
  }

  // 如果MSW启动失败，提供跳过选项
  if (process.env.NODE_ENV === 'development' && mswStatus === 'error') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        ❌ Mock Service Worker 初始化失败
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => setMswStatus('success')} 
            style={{
              padding: '8px 16px',
              background: '#1677ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            继续使用应用 (API请求可能会失败)
          </button>
        </div>
      </div>
    );
  }

  return (
    <MSWContext.Provider value={{ enabled: mockEnabled, setEnabled: setMockEnabled }}>
      {children}
      
      {/* 仅在开发模式下显示Mock开关按钮 */}
      {process.env.NODE_ENV === 'development' && <MockToggle />}
    </MSWContext.Provider>
  );
} 