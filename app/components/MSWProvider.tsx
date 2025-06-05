'use client';

import { createContext, useEffect, useState } from 'react';
import { MockToggle } from './MockToggle';
import { MSWContextType } from './types';

// 创建Mock状态的Context
export const MSWContext = createContext<MSWContextType>({
  enabled: true,
  setEnabled: () => {}
});

// localStorage键名
const MOCK_ENABLED_KEY = 'nspass-mock-enabled';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswStatus, setMswStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [mockEnabled, setMockEnabled] = useState<boolean>(true);

  useEffect(() => {
    const initMSW = async () => {
      // 只在开发模式下启动MSW
      if (process.env.NODE_ENV === 'development') {
        try {
          // 检查LocalStorage中的Mock状态
          const storedMockEnabled = localStorage.getItem(MOCK_ENABLED_KEY);
          const shouldEnableMock = storedMockEnabled !== null ? storedMockEnabled === 'true' : true;
          
          // 更新状态
          setMockEnabled(shouldEnableMock);
          
          // 如果应该启用Mock，则启动MSW
          if (shouldEnableMock) {
            const { startMSW } = await import('@mock/browser');
            await startMSW();
            console.log('🚀 MSW 已启动并准备就绪');
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

    initMSW();
  }, []);

  // 监听mockEnabled状态变化
  useEffect(() => {
    // 避免初始化时触发
    if (mswStatus !== 'loading') {
      localStorage.setItem(MOCK_ENABLED_KEY, String(mockEnabled));
    }
  }, [mockEnabled, mswStatus]);

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