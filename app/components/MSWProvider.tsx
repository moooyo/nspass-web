'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswStatus, setMswStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const initMSW = async () => {
      // 只在开发模式下启动MSW
      if (process.env.NODE_ENV === 'development') {
        try {
          const { startMSW } = await import('@mock/browser');
          await startMSW();
          console.log('🚀 MSW 已启动并准备就绪');
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

  // 使用 div 包装而不是 Fragment，避免 React 19 的兼容性问题
  return <div style={{ height: '100%', width: '100%' }}>{children}</div>;
} 