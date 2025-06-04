'use client';

import { useEffect, useState } from 'react';
import { Spin, Alert, Switch, Space, Typography } from 'antd';

const { Text } = Typography;

interface MSWProviderProps {
  children: React.ReactNode;
}

export function MSWProvider({ children }: MSWProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isMSWEnabled, setIsMSWEnabled] = useState(true);

  useEffect(() => {
    const initMSW = async () => {
      // 只在浏览器环境和开发模式下启动MSW
      if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
        setIsLoading(false);
        return;
      }

      try {
        const { startMSW } = await import('@/src/mocks/browser');
        if (isMSWEnabled) {
          await startMSW();
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to start MSW:', error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    if (isMSWEnabled) {
      initMSW();
    } else {
      setIsLoading(false);
    }
  }, [isMSWEnabled]);

  const handleToggleMSW = async (enabled: boolean) => {
    setIsMSWEnabled(enabled);
    
    if (enabled) {
      setIsLoading(true);
      try {
        const { startMSW } = await import('@/src/mocks/browser');
        await startMSW();
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to start MSW:', error);
        setIsError(true);
        setIsLoading(false);
      }
    } else {
      try {
        const { stopMSW } = await import('@/src/mocks/browser');
        stopMSW();
      } catch (error) {
        console.error('Failed to stop MSW:', error);
      }
    }
  };

  // 开发环境显示MSW控制面板
  const MSWControls = () => {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }

    return (
      <div style={{ 
        position: 'fixed', 
        top: 16, 
        right: 16, 
        zIndex: 9999,
        background: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #d9d9d9'
      }}>
        <Space align="center">
          <Text strong style={{ fontSize: '12px' }}>Mock API:</Text>
          <Switch 
            size="small"
            checked={isMSWEnabled}
            onChange={handleToggleMSW}
            loading={isLoading}
          />
          <Text style={{ fontSize: '12px', color: isMSWEnabled ? '#52c41a' : '#999' }}>
            {isMSWEnabled ? '已启用' : '已禁用'}
          </Text>
        </Space>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <Spin size="large" />
        <Text>正在启动 Mock Service Worker...</Text>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="MSW 启动失败"
          description="Mock Service Worker 无法启动，请检查控制台错误信息。你仍然可以继续使用应用，但API调用可能会失败。"
          type="error"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <>
      <MSWControls />
      {children}
    </>
  );
} 