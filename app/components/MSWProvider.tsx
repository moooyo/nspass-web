'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isMSWReady, setIsMSWReady] = useState(false);

  useEffect(() => {
    const initMSW = async () => {
      // 只在浏览器环境和开发模式下启动MSW
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        try {
          const { startMSW } = await import('@/mocks/browser');
          await startMSW();
          console.log('🚀 MSW 已启动并准备就绪');
        } catch (error) {
          console.error('MSW 启动失败:', error);
        }
      }
      setIsMSWReady(true);
    };

    initMSW();
  }, []);

  // 在开发环境中，等待MSW准备就绪再渲染应用
  if (process.env.NODE_ENV === 'development' && !isMSWReady) {
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

  return <>{children}</>;
} 