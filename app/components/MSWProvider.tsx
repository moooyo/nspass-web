'use client';

import { useEffect, useState, useRef } from 'react';
import { httpClient } from '@/utils/http-client';
import { MSWContext, MSWContextType } from './types';

// localStorage键名
const MOCK_ENABLED_KEY = 'nspass-mock-enabled';

// 全局标志，防止重复初始化
let mswInitialized = false;
let mswInitializing = false;

// MockToggle组件
const MockToggle = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return null;
  }

  // 动态导入MockToggle组件
  const [ToggleComponent, setToggleComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import('./MockToggle').then(({ MockToggle }) => {
      setToggleComponent(() => MockToggle);
    });
  }, []);

  return ToggleComponent ? <ToggleComponent /> : null;
};

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [mswStatus, setMswStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [mockEnabled, setMockEnabled] = useState<boolean>(true);
  const initializationAttempted = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || initializationAttempted.current) {
      return;
    }

    initializationAttempted.current = true;

    const initializeMSW = async () => {
      if (process.env.NODE_ENV !== 'development') {
        setMswStatus('success');
        return;
      }

      if (mswInitialized) {
        setMswStatus('success');
        return;
      }

      if (mswInitializing) {
        let attempts = 0;
        while (mswInitializing && attempts < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        setMswStatus(mswInitialized ? 'success' : 'error');
        return;
      }

      try {
        mswInitializing = true;
        setMswStatus('loading');

        const storedMockEnabled = localStorage.getItem(MOCK_ENABLED_KEY);
        const shouldEnableMock = storedMockEnabled !== null ? storedMockEnabled === 'true' : true;
        
        setMockEnabled(shouldEnableMock);
        
        if (shouldEnableMock) {
          // 动态导入MSW初始化函数
          const { initMSW } = await import('../init-msw');
          const success = await initMSW();
          
          if (success) {
            mswInitialized = true;
            // MSW启用时，使用空字符串让请求被MSW拦截
            httpClient.updateBaseURL('');
            console.log('🚀 MSW已启动，API请求将被Mock拦截');
          } else {
            setMswStatus('error');
            return;
          }
        } else {
          mswInitialized = true;
          // MSW未启用时，使用真实后端地址
          const realApiUrl = process.env.NEXT_PUBLIC_REAL_API_URL || 'http://localhost:8080';
          httpClient.updateBaseURL(realApiUrl);
          console.log(`⏹️ MSW未启用，API请求将发送到: ${realApiUrl}`);
        }
        
        setMswStatus('success');
      } catch (error) {
        console.error('MSW 启动失败:', error);
        setMswStatus('error');
        // 错误时使用真实后端地址
        const realApiUrl = process.env.NEXT_PUBLIC_REAL_API_URL || 'http://localhost:8080';
        httpClient.updateBaseURL(realApiUrl);
      } finally {
        mswInitializing = false;
      }
    };

    initializeMSW();
  }, [isClient]);

  useEffect(() => {
    if (isClient && mswStatus !== 'loading') {
      localStorage.setItem(MOCK_ENABLED_KEY, String(mockEnabled));
    }
  }, [mockEnabled, mswStatus, isClient]);

  if (!isClient) {
    return (
      <MSWContext.Provider value={{ enabled: true, setEnabled: () => {} }}>
        {children}
      </MSWContext.Provider>
    );
  }

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
            继续使用应用
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